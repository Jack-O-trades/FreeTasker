from django.db import models
from django.conf import settings
from decimal import Decimal


class Payment(models.Model):
    """Escrow payment between client and freelancer."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ESCROW = 'escrow', 'In Escrow'
        RELEASED = 'released', 'Released'
        REFUNDED = 'refunded', 'Refunded'
        DISPUTED = 'disputed', 'Disputed'

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='payments',
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments_sent',
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments_received',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    commission_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        help_text='Amount freelancer receives after commission',
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    transaction_id = models.CharField(max_length=100, blank=True, unique=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Payment #{self.id} - ${self.amount} ({self.get_status_display()})'

    def calculate_commission(self):
        """Calculate commission based on business rules."""
        threshold = settings.FREETASKER['COMMISSION_THRESHOLD']
        rates = settings.FREETASKER['COMMISSION_RATES']

        if self.amount < threshold:
            self.commission_rate = Decimal(str(rates['below_5000']))
        else:
            self.commission_rate = Decimal(str(rates['above_5000']))

        self.commission_amount = self.amount * self.commission_rate
        self.net_amount = self.amount - self.commission_amount

    def save(self, *args, **kwargs):
        if not self.commission_amount:
            self.calculate_commission()
        super().save(*args, **kwargs)
