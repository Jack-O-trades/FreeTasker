from django.urls import path
from . import views

app_name = 'ratings'

urlpatterns = [
    path('', views.RatingCreateView.as_view(), name='rating-create'),
    path('freelancer/<int:freelancer_id>/', views.FreelancerRatingsView.as_view(), name='freelancer-ratings'),
    path('my/', views.MyRatingsView.as_view(), name='my-ratings'),
]
