from django.contrib import admin
from .models import FreelancerService, ServiceBid, ClientFreelancerRelationship


@admin.register(FreelancerService)
class FreelancerServiceAdmin(admin.ModelAdmin):
    list_display = ['title', 'freelancer', 'price', 'status', 'total_orders', 'created_at']
    list_filter = ['status']
    search_fields = ['title', 'freelancer__email']


@admin.register(ServiceBid)
class ServiceBidAdmin(admin.ModelAdmin):
    list_display = ['service', 'bidder', 'amount', 'is_accepted', 'created_at']
    list_filter = ['is_accepted']


@admin.register(ClientFreelancerRelationship)
class ClientFreelancerRelationshipAdmin(admin.ModelAdmin):
    list_display = ['client', 'freelancer', 'projects_together', 'avg_rating_given']
    search_fields = ['client__email', 'freelancer__email']
