from rest_framework import serializers
from .models import ChatRoom, Message


class MessageSerializer(serializers.ModelSerializer):
    """Chat message serializer."""

    sender_email = serializers.CharField(source='sender.email', read_only=True)
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'room', 'sender', 'sender_email', 'sender_name',
            'content', 'is_read', 'created_at',
        ]
        read_only_fields = ['id', 'sender', 'sender_email', 'sender_name', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username


class ChatRoomSerializer(serializers.ModelSerializer):
    """Chat room serializer."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    freelancer_email = serializers.CharField(source='freelancer.email', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'project', 'project_title',
            'client', 'client_email',
            'freelancer', 'freelancer_email',
            'is_active', 'last_message', 'unread_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        user = self.context.get('request', {})
        if hasattr(user, 'user'):
            user = user.user
            return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return 0
