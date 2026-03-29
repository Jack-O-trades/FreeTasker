import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Task.settings')
django.setup()

from django.core.mail import send_mail

send_mail(
    'Welcome to FreeTasker!',
    'Your SMTP configuration is working perfectly! You can now send emails from your Django application.',
    'FreeTasker <ommlipun123@gmail.com>',
    ['ommlipun123@gmail.com'],
    fail_silently=False,
)
print("Email sent successfully!")
