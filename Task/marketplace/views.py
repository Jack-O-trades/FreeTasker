from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FreelancerService, ServiceBid, ClientFreelancerRelationship
from .serializers import (
    FreelancerServiceSerializer,
    ServiceBidSerializer,
    ClientFreelancerRelationshipSerializer,
)
from accounts.permissions import IsFreelancer, IsClient, IsNotBanned


class ServiceListView(generics.ListAPIView):
    """Browse all active freelancer services."""

    serializer_class = FreelancerServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FreelancerService.objects.filter(
            status=FreelancerService.Status.ACTIVE
        ).select_related('freelancer')


class ServiceCreateView(generics.CreateAPIView):
    """Freelancer posts a new service."""

    serializer_class = FreelancerServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View/edit/delete a service (owner only for edit/delete)."""

    serializer_class = FreelancerServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.method in ('PATCH', 'PUT', 'DELETE'):
            return FreelancerService.objects.filter(freelancer=self.request.user)
        return FreelancerService.objects.all()


class ServiceBidCreateView(generics.CreateAPIView):
    """Bid on a freelancer's service."""

    serializer_class = ServiceBidSerializer
    permission_classes = [permissions.IsAuthenticated, IsNotBanned]


class ServiceBidsListView(generics.ListAPIView):
    """View bids on a service (service owner only)."""

    serializer_class = ServiceBidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        service_id = self.kwargs['service_id']
        return ServiceBid.objects.filter(
            service_id=service_id,
            service__freelancer=self.request.user,
        ).select_related('bidder')


class RepeatHiringView(generics.ListAPIView):
    """Client sees their past freelancers for repeat hiring."""

    serializer_class = ClientFreelancerRelationshipSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_queryset(self):
        return ClientFreelancerRelationship.objects.filter(
            client=self.request.user,
        ).select_related('freelancer').order_by('-projects_together')


class RecommendedFreelancersView(APIView):
    """Recommend previous freelancers based on past projects and ratings."""

    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get(self, request):
        relationships = ClientFreelancerRelationship.objects.filter(
            client=request.user,
            avg_rating_given__gte=4.0,
        ).select_related('freelancer').order_by('-projects_together')[:10]

        serializer = ClientFreelancerRelationshipSerializer(relationships, many=True)
        return Response({
            'recommended_freelancers': serializer.data,
            'count': relationships.count(),
        })
