from rest_framework import generics, permissions
from .models import Rating
from .serializers import RatingSerializer
from accounts.permissions import IsClient


class RatingCreateView(generics.CreateAPIView):
    """Client rates a freelancer after project completion."""

    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]


class FreelancerRatingsView(generics.ListAPIView):
    """View all ratings for a freelancer."""

    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        freelancer_id = self.kwargs['freelancer_id']
        return Rating.objects.filter(
            freelancer_id=freelancer_id
        ).select_related('client', 'freelancer', 'project')


class MyRatingsView(generics.ListAPIView):
    """Freelancer views their own ratings."""

    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Rating.objects.filter(
            freelancer=self.request.user
        ).select_related('client', 'project')
