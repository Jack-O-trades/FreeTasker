from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FreelancerProfile, ClientProfile, UserSubscription, Badge, UserBadge


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'role', 'is_banned', 'is_active', 'created_at']
    list_filter = ['role', 'is_banned', 'is_active']
    search_fields = ['email', 'username']
    ordering = ['-created_at']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('FreeTasker', {
            'fields': ('role', 'phone', 'avatar', 'is_banned', 'ban_reason', 'warnings_count'),
        }),
    )


@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'avg_rating', 'completed_projects', 'is_available']
    list_filter = ['is_available']
    search_fields = ['user__email']


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'is_verified', 'total_projects_posted']
    list_filter = ['is_verified']
    search_fields = ['user__email', 'company_name']


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'tier', 'is_active', 'started_at', 'expires_at']
    list_filter = ['tier', 'is_active']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'badge_type', 'min_completed_projects', 'min_avg_rating']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'awarded_at']
