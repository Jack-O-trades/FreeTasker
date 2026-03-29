from rest_framework import serializers
from django.conf import settings
from django.utils import timezone

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    """Full project serializer."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    client_company = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'client', 'client_email', 'client_company',
            'title', 'description', 'budget', 'deadline',
            'required_skills', 'status', 'is_verified',
            'assigned_freelancer', 'total_bids',
            'attached_file', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'client', 'client_email', 'client_company',
            'status', 'is_verified', 'assigned_freelancer',
            'total_bids', 'created_at', 'updated_at',
        ]

    def get_client_company(self, obj):
        if hasattr(obj.client, 'client_profile'):
            return obj.client.client_profile.company_name
        return ''

    def validate_budget(self, value):
        min_budget = settings.FREETASKER['MIN_PROJECT_BUDGET']
        if value < min_budget:
            raise serializers.ValidationError(
                f'Budget must be at least {min_budget}.'
            )
        return value

    def validate_deadline(self, value):
        if value <= timezone.now().date():
            raise serializers.ValidationError(
                'Deadline must be in the future.'
            )
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['client'] = user

        # Auto-set verified flag from client profile
        if hasattr(user, 'client_profile'):
            validated_data['is_verified'] = user.client_profile.is_verified

        project = Project.objects.create(**validated_data)

        # Increment client's project count
        if hasattr(user, 'client_profile'):
            user.client_profile.total_projects_posted += 1
            user.client_profile.save(update_fields=['total_projects_posted'])

        return project


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project listings."""

    client_email = serializers.CharField(source='client.email', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'budget', 'deadline',
            'required_skills', 'status', 'is_verified',
            'total_bids', 'client_email', 'attached_file', 'created_at',
        ]
