from django.urls import path
from . import views

app_name = 'bids'

urlpatterns = [
    path('', views.BidCreateView.as_view(), name='bid-create'),
    path('my/', views.MyBidsView.as_view(), name='my-bids'),
    path('project/<int:project_id>/', views.ProjectBidsView.as_view(), name='project-bids'),
    path('<int:bid_id>/status/', views.BidStatusUpdateView.as_view(), name='bid-status-update'),
    path('<int:pk>/detail/', views.BidDetailView.as_view(), name='bid-detail'),
]
