from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path(
        'freelancer/<int:user_id>/',
        views.FreelancerProfileDetailView.as_view(),
        name='freelancer-profile',
    ),
    path(
        'client/<int:user_id>/',
        views.ClientProfileDetailView.as_view(),
        name='client-profile',
    ),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('subscription/', views.SubscriptionView.as_view(), name='subscription'),
]
