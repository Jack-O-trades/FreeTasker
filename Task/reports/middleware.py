import time
from django.conf import settings
from django.http import JsonResponse


class RateLimitMiddleware:
    """
    Rate limiting middleware: 1 action per 3 seconds per user.
    Only applies to POST/PATCH/PUT/DELETE (write operations).
    """

    # In-memory store for rate limiting (use Redis in production)
    _rate_limit_cache = {}

    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit_seconds = settings.FREETASKER.get('RATE_LIMIT_SECONDS', 3)

    def __call__(self, request):
        # Only rate-limit write operations from authenticated users
        if request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_id = request.user.id
                current_time = time.time()
                last_action_time = self._rate_limit_cache.get(user_id, 0)

                if current_time - last_action_time < self.rate_limit_seconds:
                    remaining = round(self.rate_limit_seconds - (current_time - last_action_time), 1)
                    return JsonResponse(
                        {
                            'error': 'Rate limit exceeded.',
                            'detail': f'Please wait {remaining} seconds before your next action.',
                            'retry_after': remaining,
                        },
                        status=429,
                    )

                self._rate_limit_cache[user_id] = current_time

        response = self.get_response(request)
        return response
