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
    client_name = serializers.CharField(source='client.username', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.username', read_only=True)
    client_profile = serializers.SerializerMethodField()
    freelancer_profile = serializers.SerializerMethodField()
    project_title = serializers.CharField(source='project.title', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'project', 'project_title',
            'client', 'client_email', 'client_name', 'client_profile',
            'freelancer', 'freelancer_email', 'freelancer_name', 'freelancer_profile',
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
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return 0

    def get_client_profile(self, obj):
        try:
            prof = obj.client.client_profile
            return {
                "is_verified": prof.is_verified,
                "avg_rating": getattr(obj.freelancer.freelancer_profile, 'avg_rating', 0) if hasattr(obj.freelancer, 'freelancer_profile') else 0,
                "total_ratings": getattr(obj.freelancer.freelancer_profile, 'total_ratings', 0) if hasattr(obj.freelancer, 'freelancer_profile') else 0,
                "company_name": prof.company_name
            }
        except Exception:
            return None

    def get_freelancer_profile(self, obj):
        try:
            prof = obj.freelancer.freelancer_profile
            return {
                "skills": prof.skills,
                "hourly_rate": str(prof.hourly_rate) if prof.hourly_rate else "0",
                "avg_rating": prof.avg_rating,
                "completed_projects": prof.completed_projects
            }
        except Exception:
            return None
