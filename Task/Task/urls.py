"""
FreeTasker URL Configuration.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/bids/', include('bids.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/ratings/', include('ratings.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/marketplace/', include('marketplace.urls')),
    path('api/ai/', include('ai_services.urls')),
]
