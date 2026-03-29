from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bid
from .serializers import BidSerializer, BidListSerializer, BidStatusUpdateSerializer
from accounts.permissions import IsFreelancer, IsClient, IsNotBanned


def _check_and_log_profanity_bid(user, text, context_id=None):
    """Run profanity scan on bid text and log a ProfanityReport if detected."""
    from reports.profanity import scan_for_profanity
    from reports.models import ProfanityReport

    has_profanity, found_words = scan_for_profanity(text or '')
    if has_profanity:
        ProfanityReport.objects.create(
            user=user,
            content_type=ProfanityReport.ContentType.BID,
            content_snippet=text[:500],
            detected_words=found_words,
            context_id=context_id,
        )
    return has_profanity, found_words


class BidCreateView(generics.CreateAPIView):
    """Freelancer submits a bid. POST /api/bids/"""

    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def perform_create(self, serializer):
        bid = serializer.save()
        # Scan bid proposal/message for profanity
        proposal_text = getattr(bid, 'proposal', '') or getattr(bid, 'message', '') or ''
        if proposal_text:
            _check_and_log_profanity_bid(self.request.user, proposal_text, context_id=bid.id)


class MyBidsView(generics.ListAPIView):
    """Freelancer views their own bids with transparency (status, rank)."""

    serializer_class = BidListSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def get_queryset(self):
        return Bid.objects.filter(
            freelancer=self.request.user
        ).select_related('project')


class ProjectBidsView(generics.ListAPIView):
    """Client views all bids for their project. GET /api/bids/project/<id>/"""

    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Bid.objects.filter(
            project_id=project_id,
            project__client=self.request.user,
        ).select_related('freelancer', 'project')


class BidStatusUpdateView(APIView):
    """Client updates bid status (shortlist, reject, ignore)."""

    permission_classes = [permissions.IsAuthenticated, IsClient]

    def patch(self, request, bid_id):
        try:
            bid = Bid.objects.select_related('project').get(
                id=bid_id,
                project__client=request.user,
            )
        except Bid.DoesNotExist:
            return Response(
                {'error': 'Bid not found or you do not own this project.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BidStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        bid.status = new_status
        bid.save(update_fields=['status', 'updated_at'])

        # Auto-create Chat Room on Shortlist
        if new_status == 'shortlisted':
            from chat.models import ChatRoom
            ChatRoom.objects.get_or_create(
                project=bid.project,
                client=request.user,
                freelancer=bid.freelancer
            )

        # Dispatch Email Notification
        from django.core.mail import send_mail
        from django.conf import settings
        try:
            send_mail(
                subject=f"Update on your bid: '{bid.project.title}'",
                message=f"Hi {bid.freelancer.first_name or 'there'},\n\nThe client has updated your bid status to '{new_status}' for the project '{bid.project.title}'.\n\n- The FreeTasker Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[bid.freelancer.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            'message': f'Bid status updated to {new_status}.',
            'bid': BidSerializer(bid).data,
        })


class BidDetailView(generics.RetrieveAPIView):
    """View single bid detail."""

    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_freelancer:
            return Bid.objects.filter(freelancer=user)
        elif user.is_client:
            return Bid.objects.filter(project__client=user)
        return Bid.objects.none()
