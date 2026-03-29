from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    FreelancerProfileSerializer,
    ClientProfileSerializer,
    UserSubscriptionSerializer,
    ChangePasswordSerializer,
)
from .models import FreelancerProfile, ClientProfile, UserSubscription
from .permissions import IsOwnerOrAdmin, IsFreelancer, IsClient

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new user (freelancer or client)."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Registration successful.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """JWT login — returns access + refresh tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """Get or update the authenticated user's profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = UserSerializer(user).data

        if user.is_freelancer:
            profile = FreelancerProfile.objects.get(user=user)
            data['profile'] = FreelancerProfileSerializer(profile).data
        elif user.is_client:
            profile = ClientProfile.objects.get(user=user)
            data['profile'] = ClientProfileSerializer(profile).data

        # Subscription
        sub = UserSubscription.objects.filter(user=user).first()
        if sub:
            data['subscription'] = UserSubscriptionSerializer(sub).data

        return Response(data)

    def patch(self, request):
        user = request.user
        user_serializer = UserSerializer(user, data=request.data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        # Update profile
        if user.is_freelancer and hasattr(user, 'freelancer_profile'):
            profile_serializer = FreelancerProfileSerializer(
                user.freelancer_profile, data=request.data, partial=True
            )
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()
        elif user.is_client and hasattr(user, 'client_profile'):
            profile_serializer = ClientProfileSerializer(
                user.client_profile, data=request.data, partial=True
            )
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()

        return Response({'message': 'Profile updated.'})


class FreelancerProfileDetailView(generics.RetrieveAPIView):
    """View any freelancer's public profile."""

    serializer_class = FreelancerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FreelancerProfile.objects.select_related('user').all()
    lookup_field = 'user__id'
    lookup_url_kwarg = 'user_id'


class ClientProfileDetailView(generics.RetrieveAPIView):
    """View any client's public profile."""

    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ClientProfile.objects.select_related('user').all()
    lookup_field = 'user__id'
    lookup_url_kwarg = 'user_id'


class ChangePasswordView(APIView):
    """Change password for authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully.'})


class SubscriptionView(APIView):
    """View or update subscription tier."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub, _ = UserSubscription.objects.get_or_create(user=request.user)
        return Response(UserSubscriptionSerializer(sub).data)

    def patch(self, request):
        sub, _ = UserSubscription.objects.get_or_create(user=request.user)
        serializer = UserSubscriptionSerializer(sub, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
