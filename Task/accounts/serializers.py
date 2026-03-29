from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from .models import FreelancerProfile, ClientProfile, UserSubscription, Badge, UserBadge

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """User registration with role selection."""

    password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True)
    skills = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password2',
            'role', 'first_name', 'last_name', 'phone', 'skills',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )
        if attrs.get('role') == User.Role.ADMIN:
            raise serializers.ValidationError(
                {'role': 'Cannot register as admin.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        skills = validated_data.pop('skills', [])
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Create corresponding profile
        if user.role == User.Role.FREELANCER:
            FreelancerProfile.objects.create(user=user, skills=skills)
        elif user.role == User.Role.CLIENT:
            ClientProfile.objects.create(user=user)

        # Create default subscription
        UserSubscription.objects.create(user=user, tier=UserSubscription.Tier.FREE)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT token with extra user info in claims."""

    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['username'] = user.username
        return token

    def validate(self, attrs):
        # Map email to username field for auth
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password'),
        }

        user = User.objects.filter(email=credentials['email']).first()
        if user is None:
            raise serializers.ValidationError('No user found with this email.')

        if user.is_banned:
            raise serializers.ValidationError(
                'Your account has been banned. Reason: ' + (user.ban_reason or 'N/A')
            )

        if not user.check_password(credentials['password']):
            raise serializers.ValidationError('Invalid password.')

        if not user.is_active:
            raise serializers.ValidationError('Account is not active.')

        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    """Basic user info."""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'role', 'first_name',
            'last_name', 'phone', 'is_banned', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_banned', 'created_at']


class FreelancerProfileSerializer(serializers.ModelSerializer):
    """Freelancer profile details."""

    user = UserSerializer(read_only=True)
    badges = serializers.SerializerMethodField()

    class Meta:
        model = FreelancerProfile
        fields = [
            'id', 'user', 'bio', 'skills', 'hourly_rate',
            'portfolio_url', 'experience_years', 'avg_rating',
            'total_ratings', 'completed_projects', 'is_available',
            'badges', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'avg_rating', 'total_ratings',
            'completed_projects', 'created_at', 'updated_at',
        ]

    def get_badges(self, obj):
        user_badges = UserBadge.objects.filter(user=obj.user).select_related('badge')
        return BadgeSerializer([ub.badge for ub in user_badges], many=True).data


class ClientProfileSerializer(serializers.ModelSerializer):
    """Client profile details."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = ClientProfile
        fields = [
            'id', 'user', 'company_name', 'company_website',
            'description', 'is_verified', 'total_projects_posted',
            'total_spent', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'is_verified', 'total_projects_posted',
            'total_spent', 'created_at', 'updated_at',
        ]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """Subscription tier info."""

    class Meta:
        model = UserSubscription
        fields = ['id', 'tier', 'started_at', 'expires_at', 'is_active']
        read_only_fields = ['id', 'started_at']


class BadgeSerializer(serializers.ModelSerializer):
    """Badge details."""

    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'badge_type', 'description',
            'icon', 'min_completed_projects', 'min_avg_rating',
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Change password."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value
