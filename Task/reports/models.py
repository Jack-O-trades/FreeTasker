from django.db import models
from django.conf import settings


class Report(models.Model):
    """User report for spam, scam, or inappropriate behavior."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        REVIEWING = 'reviewing', 'Under Review'
        RESOLVED = 'resolved', 'Resolved'
        DISMISSED = 'dismissed', 'Dismissed'

    class Reason(models.TextChoices):
        SPAM = 'spam', 'Spam'
        SCAM = 'scam', 'Scam'
        HARASSMENT = 'harassment', 'Harassment'
        INAPPROPRIATE = 'inappropriate', 'Inappropriate Content'
        FAKE_PROFILE = 'fake_profile', 'Fake Profile'
        OTHER = 'other', 'Other'

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_filed',
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_received',
    )
    reason = models.CharField(
        max_length=20,
        choices=Reason.choices,
    )
    description = models.TextField(max_length=2000)
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_resolved',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Report: {self.reporter.email} → {self.reported_user.email} ({self.reason})'


class SpamLog(models.Model):
    """Log of rate-limited or spam-detected actions."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='spam_logs',
    )
    action = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Spam: {self.user.email} - {self.action}'


class ProfanityReport(models.Model):
    """Auto-generated report when a user sends profanity anywhere on the platform."""

    class ContentType(models.TextChoices):
        CHAT = 'chat', 'Chat Message'
        PROJECT = 'project', 'Project Description'
        BID = 'bid', 'Bid Message'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        WARNED = 'warned', 'User Warned'
        BANNED = 'banned', 'User Banned'
        DISMISSED = 'dismissed', 'Dismissed'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profanity_reports',
    )
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.CHAT,
    )
    content_snippet = models.CharField(
        max_length=500,
        help_text='The message/text that triggered the report',
    )
    detected_words = models.JSONField(
        default=list,
        help_text='List of profanity words found',
    )
    context_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='ID of the related object (chat room, project, bid)',
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='profanity_reviews',
    )
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Profanity [{self.content_type}]: {self.user.email} @ {self.created_at:%Y-%m-%d %H:%M}'
