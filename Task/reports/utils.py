"""Spam detection utilities."""

import re
from collections import Counter


def detect_spam_patterns(text):
    """
    Check text for spam-like patterns.
    Returns (is_spam: bool, reason: str).
    """
    if not text:
        return False, ''

    text_lower = text.lower().strip()

    # Check for excessive caps
    if len(text) > 10:
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text)
        if caps_ratio > 0.7:
            return True, 'Excessive capitalization detected.'

    # Check for repeated characters
    if re.search(r'(.)\1{9,}', text):
        return True, 'Excessive character repetition detected.'

    # Check for suspicious URLs/links
    url_count = len(re.findall(r'https?://\S+', text))
    if url_count > 3:
        return True, 'Too many URLs in message.'

    # Check for common spam keywords
    spam_keywords = [
        'earn money fast', 'click here now', 'free money',
        'guaranteed income', 'work from home easy',
    ]
    for keyword in spam_keywords:
        if keyword in text_lower:
            return True, f'Spam keyword detected: {keyword}'

    return False, ''


def check_repeated_messages(user, content, window_seconds=60):
    """
    Check if user has sent the same message recently.
    Returns True if suspected spam.
    """
    from django.utils import timezone
    from datetime import timedelta
    from chat.models import Message

    recent = Message.objects.filter(
        sender=user,
        content=content,
        created_at__gte=timezone.now() - timedelta(seconds=window_seconds),
    ).count()

    return recent >= 2


def handle_spam_warning(user):
    """
    Handle spam warning escalation:
    1st-2nd: Warning
    3rd: Auto-report
    5th+: Admin review / potential ban
    """
    user.warnings_count += 1
    user.save(update_fields=['warnings_count'])

    if user.warnings_count >= 5:
        user.is_banned = True
        user.ban_reason = 'Automatic ban: excessive spam warnings.'
        user.save(update_fields=['is_banned', 'ban_reason'])
        return 'banned'
    elif user.warnings_count >= 3:
        from .models import Report
        Report.objects.get_or_create(
            reporter=user,
            reported_user=user,
            reason='spam',
            defaults={
                'description': f'Auto-generated: user has {user.warnings_count} spam warnings.',
            },
        )
        return 'reported'
    else:
        return 'warned'
