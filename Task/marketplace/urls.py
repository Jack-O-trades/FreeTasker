from django.urls import path
from . import views

app_name = 'marketplace'

urlpatterns = [
    # Freelancer services
    path('services/', views.ServiceListView.as_view(), name='service-list'),
    path('services/create/', views.ServiceCreateView.as_view(), name='service-create'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    path('services/<int:service_id>/bids/', views.ServiceBidsListView.as_view(), name='service-bids'),
    path('services/bid/', views.ServiceBidCreateView.as_view(), name='service-bid-create'),

    # Repeat hiring
    path('repeat-hiring/', views.RepeatHiringView.as_view(), name='repeat-hiring'),
    path('recommended/', views.RecommendedFreelancersView.as_view(), name='recommended-freelancers'),
]
