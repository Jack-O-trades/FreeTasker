from rest_framework import serializers
from .models import Report, ProfanityReport


class ReportSerializer(serializers.ModelSerializer):
    """Report serializer."""

    reporter_email = serializers.CharField(source='reporter.email', read_only=True)
    reported_user_email = serializers.CharField(source='reported_user.email', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reporter_email',
            'reported_user', 'reported_user_email',
            'reason', 'description', 'status',
            'admin_notes', 'resolved_by',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reporter', 'reporter_email',
            'reported_user_email', 'status',
            'admin_notes', 'resolved_by',
            'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class ProfanityReportSerializer(serializers.ModelSerializer):
    """Serializer for bot-generated profanity reports (admin-facing)."""

    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    reviewed_by_email = serializers.CharField(source='reviewed_by.email', read_only=True)

    class Meta:
        model = ProfanityReport
        fields = [
            'id', 'user', 'user_email', 'user_role',
            'content_type', 'content_snippet', 'detected_words',
            'context_id', 'status',
            'reviewed_by', 'reviewed_by_email',
            'admin_notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'user', 'user_email', 'user_role',
            'content_type', 'content_snippet', 'detected_words',
            'context_id', 'reviewed_by', 'reviewed_by_email',
            'created_at', 'updated_at',
        ]
