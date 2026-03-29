from rest_framework import serializers
from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    """Full rating serializer."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    freelancer_email = serializers.CharField(source='freelancer.email', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'client', 'client_email',
            'freelancer', 'freelancer_email',
            'project', 'project_title',
            'communication', 'responsibility',
            'performance', 'professionalism',
            'average', 'review', 'created_at',
        ]
        read_only_fields = [
            'id', 'client', 'client_email',
            'freelancer_email', 'project_title',
            'average', 'created_at',
        ]

    def validate(self, attrs):
        request = self.context['request']
        project = attrs.get('project')

        if project and project.client != request.user:
            raise serializers.ValidationError(
                'Only the project owner can rate freelancers.'
            )

        if project and project.status != 'completed':
            raise serializers.ValidationError(
                'Can only rate after project completion.'
            )

        return attrs

    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)
