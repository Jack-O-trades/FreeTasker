from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # User endpoints
    path('', views.ReportCreateView.as_view(), name='report-create'),
    path('my/', views.MyReportsView.as_view(), name='my-reports'),

    # Admin: User reports
    path('admin/', views.AdminReportsView.as_view(), name='admin-reports'),
    path('admin/<int:report_id>/action/', views.AdminReportActionView.as_view(), name='admin-report-action'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/ban/', views.AdminBanUserView.as_view(), name='admin-ban-user'),

    # Admin: Profanity bot reports
    path('admin/profanity/', views.AdminProfanityReportsView.as_view(), name='admin-profanity-reports'),
    path('admin/profanity/<int:report_id>/action/', views.AdminProfanityActionView.as_view(), name='admin-profanity-action'),
]
