from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import Report, ProfanityReport
from .serializers import ReportSerializer, ProfanityReportSerializer
from accounts.permissions import IsAdmin, IsNotBanned

User = get_user_model()


class ReportCreateView(generics.CreateAPIView):
    """File a report against a user."""

    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsNotBanned]


class MyReportsView(generics.ListAPIView):
    """View reports I've filed."""

    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(reporter=self.request.user)


# ---- Admin: User Reports ----

class AdminReportsView(generics.ListAPIView):
    """Admin views all pending reports."""

    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Report.objects.select_related('reporter', 'reported_user').all()


class AdminReportActionView(APIView):
    """Admin resolves or dismisses a report."""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        action = request.data.get('action')  # resolve, dismiss, ban_user
        admin_notes = request.data.get('admin_notes', '')

        if action == 'resolve':
            report.status = Report.Status.RESOLVED
        elif action == 'dismiss':
            report.status = Report.Status.DISMISSED
        elif action == 'ban_user':
            report.status = Report.Status.RESOLVED
            reported_user = report.reported_user
            reported_user.is_banned = True
            reported_user.ban_reason = admin_notes or 'Banned by admin after report review.'
            reported_user.save(update_fields=['is_banned', 'ban_reason'])
        else:
            return Response(
                {'error': 'Invalid action. Use: resolve, dismiss, ban_user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.admin_notes = admin_notes
        report.resolved_by = request.user
        report.save(update_fields=['status', 'admin_notes', 'resolved_by', 'updated_at'])

        return Response({
            'message': f'Report {action}d.',
            'report': ReportSerializer(report).data,
        })


class AdminUserListView(generics.ListAPIView):
    """Admin views all users."""

    from accounts.serializers import UserSerializer

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = User.objects.all()


class AdminBanUserView(APIView):
    """Admin bans/unbans a user."""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        action = request.data.get('action')  # ban or unban
        reason = request.data.get('reason', '')

        if action == 'ban':
            user.is_banned = True
            user.ban_reason = reason
            user.save(update_fields=['is_banned', 'ban_reason'])
            return Response({'message': f'User {user.email} has been banned.'})
        elif action == 'unban':
            user.is_banned = False
            user.ban_reason = ''
            user.warnings_count = 0
            user.save(update_fields=['is_banned', 'ban_reason', 'warnings_count'])
            return Response({'message': f'User {user.email} has been unbanned.'})
        else:
            return Response(
                {'error': 'Invalid action. Use: ban or unban.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ---- Admin: Profanity Bot Reports ----

class AdminProfanityReportsView(generics.ListAPIView):
    """Admin views all auto-generated profanity reports from the bot."""

    serializer_class = ProfanityReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        qs = ProfanityReport.objects.select_related('user', 'reviewed_by')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminProfanityActionView(APIView):
    """Admin takes action on a profanity report: dismiss, warn, or ban the user."""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, report_id):
        try:
            report = ProfanityReport.objects.select_related('user').get(id=report_id)
        except ProfanityReport.DoesNotExist:
            return Response(
                {'error': 'Profanity report not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        action = request.data.get('action')  # dismiss | warn | ban
        admin_notes = request.data.get('admin_notes', '')

        if action == 'dismiss':
            report.status = ProfanityReport.Status.DISMISSED

        elif action == 'warn':
            report.status = ProfanityReport.Status.WARNED
            user = report.user
            user.warnings_count += 1
            user.save(update_fields=['warnings_count'])

        elif action == 'ban':
            report.status = ProfanityReport.Status.BANNED
            user = report.user
            user.is_banned = True
            user.ban_reason = admin_notes or f'Banned for profanity ({report.content_type}).'
            user.save(update_fields=['is_banned', 'ban_reason'])

        else:
            return Response(
                {'error': 'Invalid action. Use: dismiss, warn, ban.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.admin_notes = admin_notes
        report.reviewed_by = request.user
        report.save(update_fields=['status', 'admin_notes', 'reviewed_by', 'updated_at'])

        return Response({
            'message': f'Profanity report marked as {action}.',
            'report': ProfanityReportSerializer(report).data,
        })

