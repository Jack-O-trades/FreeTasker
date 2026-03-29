from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Bid(models.Model):
    """Freelancer bid on a project."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VIEWED = 'viewed', 'Viewed'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        REJECTED = 'rejected', 'Rejected'
        IGNORED = 'ignored', 'Ignored'
        ACCEPTED = 'accepted', 'Accepted'

    class ProposalType(models.TextChoices):
        MANUAL = 'manual', 'Manual'
        AI_GENERATED = 'ai_generated', 'AI Generated'

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bids',
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='bids',
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(settings.FREETASKER['MIN_BID_AMOUNT'])],
    )
    proposal = models.TextField(max_length=5000)
    proposal_type = models.CharField(
        max_length=15,
        choices=ProposalType.choices,
        default=ProposalType.MANUAL,
    )
    portfolio_link = models.URLField(blank=True)
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    rank = models.PositiveIntegerField(
        default=0,
        help_text='Position/rank among all bids on this project',
    )
    delivery_days = models.PositiveIntegerField(
        default=7,
        help_text='Estimated delivery time in days',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['rank', '-created_at']
        unique_together = ('freelancer', 'project')  # Prevent duplicate bids
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['freelancer', 'created_at']),
        ]

    def __str__(self):
        return f'Bid by {self.freelancer.email} on {self.project.title} - ${self.amount}'
