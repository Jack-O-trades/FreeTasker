from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'project', 'client', 'freelancer', 'amount', 'commission_amount', 'net_amount', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['client__email', 'freelancer__email', 'transaction_id']
    readonly_fields = ['commission_rate', 'commission_amount', 'net_amount', 'transaction_id']
