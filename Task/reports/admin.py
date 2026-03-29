from django.contrib import admin
from .models import Report, SpamLog


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'reported_user', 'reason', 'status', 'created_at']
    list_filter = ['status', 'reason']
    search_fields = ['reporter__email', 'reported_user__email']


@admin.register(SpamLog)
class SpamLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'created_at']
    search_fields = ['user__email']
