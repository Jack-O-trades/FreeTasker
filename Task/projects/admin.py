from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'budget', 'status', 'total_bids', 'deadline', 'created_at']
    list_filter = ['status', 'is_verified']
    search_fields = ['title', 'description', 'client__email']
    readonly_fields = ['total_bids', 'created_at', 'updated_at']
