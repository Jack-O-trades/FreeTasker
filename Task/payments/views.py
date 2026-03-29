import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer, PaymentActionSerializer
from projects.models import Project
from accounts.permissions import IsClient, IsNotBanned


class PaymentCreateView(APIView):
    """Client creates an escrow payment for a project."""

    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project_id = serializer.validated_data['project_id']
        amount = serializer.validated_data['amount']

        try:
            project = Project.objects.get(id=project_id, client=request.user)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found or not owned by you.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not project.assigned_freelancer:
            return Response(
                {'error': 'No freelancer assigned to this project yet.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for existing active payment
        existing = Payment.objects.filter(
            project=project,
            status__in=['pending', 'escrow'],
        ).first()
        if existing:
            return Response(
                {'error': 'An active payment already exists for this project.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment(
            project=project,
            client=request.user,
            freelancer=project.assigned_freelancer,
            amount=amount,
            status=Payment.Status.ESCROW,
            transaction_id=f'TXN-{uuid.uuid4().hex[:12].upper()}',
        )
        payment.save()

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED,
        )


class PaymentActionView(APIView):
    """Client releases, refunds, or disputes a payment."""

    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, client=request.user)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']

        if payment.status != Payment.Status.ESCROW:
            return Response(
                {'error': f'Payment cannot be {action}d. Current status: {payment.status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action == 'release':
            payment.status = Payment.Status.RELEASED
            # Update freelancer's profile
            if hasattr(payment.freelancer, 'freelancer_profile'):
                profile = payment.freelancer.freelancer_profile
                profile.completed_projects += 1
                profile.save(update_fields=['completed_projects'])
            # Update project status
            payment.project.status = 'completed'
            payment.project.save(update_fields=['status'])
            # Update client's total spent
            if hasattr(payment.client, 'client_profile'):
                payment.client.client_profile.total_spent += payment.amount
                payment.client.client_profile.save(update_fields=['total_spent'])

        elif action == 'refund':
            payment.status = Payment.Status.REFUNDED

        elif action == 'dispute':
            payment.status = Payment.Status.DISPUTED

        payment.save(update_fields=['status', 'updated_at'])

        return Response({
            'message': f'Payment {action}d successfully.',
            'payment': PaymentSerializer(payment).data,
        })


class MyPaymentsView(generics.ListAPIView):
    """View user's payments (sent or received)."""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        return Payment.objects.filter(
            Q(client=user) | Q(freelancer=user)
        ).select_related('project', 'client', 'freelancer')
