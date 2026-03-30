"""WebSocket authentication middleware for JWT tokens."""

import json
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


@database_sync_to_async
def get_user_from_token(token):
    """Extract user from JWT token."""
    try:
        auth = JWTAuthentication()
        validated_token = auth.get_validated_token(token)
        user = auth.get_user(validated_token)
        return user
    except (InvalidToken, AuthenticationFailed):
        return AnonymousUser()


class WebSocketJWTAuthMiddleware:
    """
    WebSocket middleware that authenticates using JWT tokens from query parameters.
    Usage: Pass as inner protocol type in ProtocolTypeRouter.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Only apply to WebSocket connections
        if scope['type'] != 'websocket':
            return await self.inner(scope, receive, send)

        # Extract token from query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)
