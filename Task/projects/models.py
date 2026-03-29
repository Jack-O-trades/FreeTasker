from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Project(models.Model):
    """Project posted by a client for freelancers to bid on."""

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        CLOSED = 'closed', 'Closed'

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects',
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(settings.FREETASKER['MIN_PROJECT_BUDGET'])],
    )
    deadline = models.DateField()
    required_skills = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )
    is_verified = models.BooleanField(
        default=False,
        help_text='Whether the client posting this is verified',
    )
    assigned_freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_projects',
    )
    attached_file = models.FileField(
        upload_to='project_files/', 
        null=True, 
        blank=True,
        help_text='Optional PDF or document detailing project requirements'
    )
    total_bids = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['budget']),
            models.Index(fields=['deadline']),
        ]

    def __str__(self):
        return f'{self.title} (by {self.client.email})'
