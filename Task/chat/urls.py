from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('rooms/', views.MyChatRoomsView.as_view(), name='chat-rooms'),
    path('rooms/create/', views.ChatRoomCreateView.as_view(), name='chat-room-create'),
    path('rooms/<int:room_id>/messages/', views.ChatMessagesView.as_view(), name='chat-messages'),
]
