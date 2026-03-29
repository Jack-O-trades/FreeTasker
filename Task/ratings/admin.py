from django.contrib import admin
from .models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['client', 'freelancer', 'project', 'average', 'created_at']
    search_fields = ['client__email', 'freelancer__email']
    readonly_fields = ['average']
