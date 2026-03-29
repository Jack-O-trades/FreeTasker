from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('', views.MyPaymentsView.as_view(), name='my-payments'),
    path('create/', views.PaymentCreateView.as_view(), name='payment-create'),
    path('<int:payment_id>/action/', views.PaymentActionView.as_view(), name='payment-action'),
]
