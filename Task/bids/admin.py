from django.contrib import admin
from .models import Bid


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['freelancer', 'project', 'amount', 'status', 'rank', 'created_at']
    list_filter = ['status', 'proposal_type']
    search_fields = ['freelancer__email', 'project__title']
    readonly_fields = ['rank', 'created_at', 'updated_at']
