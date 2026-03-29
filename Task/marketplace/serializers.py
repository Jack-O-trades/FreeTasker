from rest_framework import serializers
from .models import FreelancerService, ServiceBid, ClientFreelancerRelationship


class FreelancerServiceSerializer(serializers.ModelSerializer):
    """Freelancer service/listing serializer."""

    freelancer_email = serializers.CharField(source='freelancer.email', read_only=True)
    freelancer_rating = serializers.SerializerMethodField()

    class Meta:
        model = FreelancerService
        fields = [
            'id', 'freelancer', 'freelancer_email', 'freelancer_rating',
            'title', 'description', 'price', 'skills',
            'delivery_days', 'status', 'total_orders',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'freelancer', 'freelancer_email',
            'freelancer_rating', 'total_orders',
            'created_at', 'updated_at',
        ]

    def get_freelancer_rating(self, obj):
        if hasattr(obj.freelancer, 'freelancer_profile'):
            return float(obj.freelancer.freelancer_profile.avg_rating)
        return 0

    def create(self, validated_data):
        validated_data['freelancer'] = self.context['request'].user
        return super().create(validated_data)


class ServiceBidSerializer(serializers.ModelSerializer):
    """Service bid serializer."""

    bidder_email = serializers.CharField(source='bidder.email', read_only=True)

    class Meta:
        model = ServiceBid
        fields = [
            'id', 'service', 'bidder', 'bidder_email',
            'amount', 'message', 'is_accepted', 'created_at',
        ]
        read_only_fields = ['id', 'bidder', 'bidder_email', 'is_accepted', 'created_at']

    def create(self, validated_data):
        validated_data['bidder'] = self.context['request'].user
        return super().create(validated_data)


class ClientFreelancerRelationshipSerializer(serializers.ModelSerializer):
    """Relationship/repeat hiring serializer."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    freelancer_email = serializers.CharField(source='freelancer.email', read_only=True)
    freelancer_name = serializers.SerializerMethodField()

    class Meta:
        model = ClientFreelancerRelationship
        fields = [
            'id', 'client', 'client_email',
            'freelancer', 'freelancer_email', 'freelancer_name',
            'projects_together', 'last_project_at',
            'avg_rating_given', 'created_at',
        ]

    def get_freelancer_name(self, obj):
        return obj.freelancer.get_full_name() or obj.freelancer.username
