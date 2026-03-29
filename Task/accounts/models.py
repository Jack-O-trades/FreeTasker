from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """Custom user with role-based access."""

    class Role(models.TextChoices):
        FREELANCER = 'freelancer', 'Freelancer'
        CLIENT = 'client', 'Client'
        ADMIN = 'admin', 'Admin'

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.FREELANCER,
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True)
    warnings_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.email} ({self.get_role_display()})'

    @property
    def is_freelancer(self):
        return self.role == self.Role.FREELANCER

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN


class FreelancerProfile(models.Model):
    """Extended profile for freelancers."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='freelancer_profile',
    )
    bio = models.TextField(blank=True, max_length=2000)
    skills = models.JSONField(default=list, blank=True)
    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    portfolio_url = models.URLField(blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    avg_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_ratings = models.PositiveIntegerField(default=0)
    completed_projects = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Freelancer: {self.user.email}'


class ClientProfile(models.Model):
    """Extended profile for clients."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='client_profile',
    )
    company_name = models.CharField(max_length=255, blank=True)
    company_website = models.URLField(blank=True)
    description = models.TextField(blank=True, max_length=2000)
    is_verified = models.BooleanField(default=False)
    total_projects_posted = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Client: {self.user.email}'


class UserSubscription(models.Model):
    """Subscription tier for bid limits and features."""

    class Tier(models.TextChoices):
        FREE = 'free', 'Free'
        PRO = 'pro', 'Pro'
        PREMIUM = 'premium', 'Premium'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='subscription',
    )
    tier = models.CharField(
        max_length=10,
        choices=Tier.choices,
        default=Tier.FREE,
    )
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.user.email} - {self.get_tier_display()}'


class Badge(models.Model):
    """Achievement badges for freelancers."""

    class BadgeType(models.TextChoices):
        RISING_STAR = 'rising_star', 'Rising Star'
        TOP_RATED = 'top_rated', 'Top Rated'
        EXPERT = 'expert', 'Expert'
        VETERAN = 'veteran', 'Veteran'
        ELITE = 'elite', 'Elite'

    name = models.CharField(max_length=100)
    badge_type = models.CharField(
        max_length=20,
        choices=BadgeType.choices,
        unique=True,
    )
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, help_text='Icon identifier or emoji')
    min_completed_projects = models.PositiveIntegerField(default=0)
    min_avg_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['min_completed_projects']

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    """Many-to-many through model for user badges."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='badges',
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='holders',
    )
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')
        ordering = ['-awarded_at']

    def __str__(self):
        return f'{self.user.email} - {self.badge.name}'
