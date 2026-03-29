import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat with profanity detection."""

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope.get('user')

        # Validate access
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        has_access = await self.check_room_access()
        if not has_access:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get('message', '').strip()

        if not message_content:
            return

        # Check for spam (rate limiting handled by middleware for HTTP)
        is_spam = await self.check_spam(message_content)
        if is_spam:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Message detected as spam. Please wait before sending again.',
            }))
            return

        # ---- Profanity Bot: scan message ----
        has_profanity, found_words = self.scan_profanity(message_content)
        if has_profanity:
            # Log to DB for admin review (non-blocking)
            await self.log_profanity_report(message_content, found_words)
            # Warn the sender via WebSocket (message still goes through)
            await self.send(text_data=json.dumps({
                'type': 'warning',
                'message': (
                    '⚠️ Your message contains inappropriate language and has been flagged for admin review.'
                ),
            }))

        # Save message to database
        message = await self.save_message(message_content)

        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'sender_id': self.user.id,
                'sender_email': self.user.email,
                'sender_name': self.user.get_full_name() or self.user.username,
                'message_id': message.id,
                'timestamp': str(message.created_at),
                'flagged': has_profanity,
            },
        )

    async def chat_message(self, event):
        """Send message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_email': event['sender_email'],
            'sender_name': event['sender_name'],
            'message_id': event['message_id'],
            'timestamp': event['timestamp'],
            'flagged': event.get('flagged', False),
        }))

    def scan_profanity(self, content):
        """Synchronous profanity scan (no DB access needed)."""
        from reports.profanity import scan_for_profanity
        return scan_for_profanity(content)

    @database_sync_to_async
    def check_room_access(self):
        """Only project owner and shortlisted freelancer can access."""
        from .models import ChatRoom

        try:
            room = ChatRoom.objects.get(id=self.room_id, is_active=True)
            return self.user.id in (room.client_id, room.freelancer_id)
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        from .models import ChatRoom, Message

        room = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(
            room=room,
            sender=self.user,
            content=content,
        )

    @database_sync_to_async
    def log_profanity_report(self, content, found_words):
        """Create a ProfanityReport for the admin to review."""
        from reports.models import ProfanityReport

        ProfanityReport.objects.create(
            user=self.user,
            content_type=ProfanityReport.ContentType.CHAT,
            content_snippet=content[:500],
            detected_words=found_words,
            context_id=int(self.room_id),
        )

    @database_sync_to_async
    def check_spam(self, content):
        """Basic spam detection: check for repeated messages."""
        from .models import Message
        from django.utils import timezone
        from datetime import timedelta

        recent_messages = Message.objects.filter(
            room_id=self.room_id,
            sender=self.user,
            created_at__gte=timezone.now() - timedelta(seconds=10),
        )

        # Rate: max 3 messages in 10 seconds
        if recent_messages.count() >= 3:
            return True

        # Repeated content check
        if recent_messages.filter(content=content).exists():
            return True

        return False

