from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class FreelancerService(models.Model):
    """Services/projects posted by freelancers for auction/bidding."""

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        SOLD = 'sold', 'Sold'
        CLOSED = 'closed', 'Closed'

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='services',
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(100)],
    )
    skills = models.JSONField(default=list, blank=True)
    delivery_days = models.PositiveIntegerField(default=7)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    total_orders = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} by {self.freelancer.email}'


class ServiceBid(models.Model):
    """Bid on a freelancer's service."""

    service = models.ForeignKey(
        FreelancerService,
        on_delete=models.CASCADE,
        related_name='bids',
    )
    bidder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_bids',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    message = models.TextField(blank=True, max_length=2000)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-amount', '-created_at']
        unique_together = ('service', 'bidder')

    def __str__(self):
        return f'Bid ${self.amount} on {self.service.title} by {self.bidder.email}'


class ClientFreelancerRelationship(models.Model):
    """Track repeat hiring between clients and freelancers."""

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='freelancer_relationships',
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_relationships',
    )
    projects_together = models.PositiveIntegerField(default=0)
    last_project_at = models.DateTimeField(auto_now=True)
    avg_rating_given = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('client', 'freelancer')
        ordering = ['-projects_together']

    def __str__(self):
        return f'{self.client.email} ↔ {self.freelancer.email} ({self.projects_together} projects)'
