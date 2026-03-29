from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Rating(models.Model):
    """Client rates freelancer after project completion."""

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given',
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_received',
    )
    project = models.OneToOneField(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='rating',
    )
    communication = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    responsibility = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    performance = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    professionalism = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    average = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
    )
    review = models.TextField(blank=True, max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('client', 'freelancer', 'project')

    def __str__(self):
        return f'Rating: {self.freelancer.email} - {self.average}/5 by {self.client.email}'

    def calculate_average(self):
        self.average = round(
            (self.communication + self.responsibility +
             self.performance + self.professionalism) / 4, 2
        )

    def save(self, *args, **kwargs):
        self.calculate_average()
        super().save(*args, **kwargs)
        # Update freelancer's average rating
        self._update_freelancer_rating()

    def _update_freelancer_rating(self):
        from django.db.models import Avg
        from accounts.models import FreelancerProfile

        ratings = Rating.objects.filter(freelancer=self.freelancer)
        avg = ratings.aggregate(avg=Avg('average'))['avg'] or 0

        FreelancerProfile.objects.filter(user=self.freelancer).update(
            avg_rating=round(avg, 2),
            total_ratings=ratings.count(),
        )
