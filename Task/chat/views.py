from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from bids.models import Bid
from accounts.permissions import IsNotBanned


class ChatRoomCreateView(APIView):
    """Create a chat room when freelancer is shortlisted."""

    permission_classes = [permissions.IsAuthenticated, IsNotBanned]

    def post(self, request):
        project_id = request.data.get('project_id')
        freelancer_id = request.data.get('freelancer_id')

        if not project_id or not freelancer_id:
            return Response(
                {'error': 'project_id and freelancer_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify the freelancer is shortlisted
        bid = Bid.objects.filter(
            project_id=project_id,
            freelancer_id=freelancer_id,
            status='shortlisted',
        ).first()

        if not bid:
            return Response(
                {'error': 'Chat is only allowed with shortlisted freelancers.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Verify the requesting user is the project client
        if bid.project.client != request.user:
            return Response(
                {'error': 'Only the project owner can initiate chat.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        room, created = ChatRoom.objects.get_or_create(
            project_id=project_id,
            client=request.user,
            freelancer_id=freelancer_id,
        )

        return Response(
            ChatRoomSerializer(room, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class MyChatRoomsView(generics.ListAPIView):
    """List user's chat rooms."""

    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        return ChatRoom.objects.filter(
            Q(client=user) | Q(freelancer=user),
            is_active=True,
        ).select_related('project', 'client', 'freelancer')


class ChatMessagesView(generics.ListAPIView):
    """Get messages for a chat room."""

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        user = self.request.user

        # Verify access
        try:
            room = ChatRoom.objects.get(
                id=room_id,
            )
            if user.id not in (room.client_id, room.freelancer_id):
                return Message.objects.none()
        except ChatRoom.DoesNotExist:
            return Message.objects.none()

        # Mark messages as read
        Message.objects.filter(
            room_id=room_id,
            is_read=False,
        ).exclude(sender=user).update(is_read=True)

        return Message.objects.filter(room_id=room_id).select_related('sender')
