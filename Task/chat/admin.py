from django.contrib import admin
from .models import ChatRoom, Message


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['project', 'client', 'freelancer', 'is_active', 'created_at']
    list_filter = ['is_active']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['room', 'sender', 'content_preview', 'is_read', 'created_at']
    list_filter = ['is_read']

    def content_preview(self, obj):
        return obj.content[:80]
    content_preview.short_description = 'Content'
