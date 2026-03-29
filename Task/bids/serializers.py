from rest_framework import serializers
from django.conf import settings
from django.utils import timezone

from .models import Bid
from accounts.models import UserSubscription


class BidSerializer(serializers.ModelSerializer):
    """Full bid serializer."""

    freelancer_email = serializers.CharField(source='freelancer.email', read_only=True)
    freelancer_name = serializers.SerializerMethodField()
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Bid
        fields = [
            'id', 'freelancer', 'freelancer_email', 'freelancer_name',
            'project', 'project_title', 'amount', 'proposal',
            'proposal_type', 'portfolio_link', 'status', 'rank',
            'delivery_days', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'freelancer', 'freelancer_email', 'freelancer_name',
            'project_title', 'status', 'rank', 'created_at', 'updated_at',
        ]

    def get_freelancer_name(self, obj):
        return obj.freelancer.get_full_name() or obj.freelancer.username

    def validate_amount(self, value):
        min_bid = settings.FREETASKER['MIN_BID_AMOUNT']
        if value < min_bid:
            raise serializers.ValidationError(
                f'Bid amount must be at least {min_bid}.'
            )
        return value

    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        project = attrs.get('project')

        # Prevent bidding on own project
        if project and project.client == user:
            raise serializers.ValidationError(
                'You cannot bid on your own project.'
            )

        # Check project is open
        if project and project.status != 'open':
            raise serializers.ValidationError(
                'This project is not accepting bids.'
            )

        # Check duplicate bid
        if Bid.objects.filter(freelancer=user, project=project).exists():
            raise serializers.ValidationError(
                'You have already placed a bid on this project.'
            )

        # Check daily bid limit
        today = timezone.now().date()
        todays_bids = Bid.objects.filter(
            freelancer=user,
            created_at__date=today,
        ).count()

        sub = UserSubscription.objects.filter(user=user).first()
        tier = sub.tier if sub else 'free'
        daily_limit = settings.FREETASKER['DAILY_BID_LIMITS'].get(tier, 5)

        if todays_bids >= daily_limit:
            raise serializers.ValidationError(
                f'Daily bid limit reached ({daily_limit} bids/day for {tier} tier). '
                f'Upgrade your subscription for more bids.'
            )

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['freelancer'] = user

        project = validated_data['project']

        # Calculate rank (position among bids)
        current_bid_count = Bid.objects.filter(project=project).count()
        validated_data['rank'] = current_bid_count + 1

        bid = Bid.objects.create(**validated_data)

        # Update project bid count
        project.total_bids = current_bid_count + 1
        project.save(update_fields=['total_bids'])

        return bid


class BidListSerializer(serializers.ModelSerializer):
    """Lightweight bid listing for freelancers."""

    project_title = serializers.CharField(source='project.title', read_only=True)
    project_budget = serializers.DecimalField(
        source='project.budget', max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Bid
        fields = [
            'id', 'project', 'project_title', 'project_budget',
            'amount', 'status', 'rank', 'created_at',
        ]


class BidStatusUpdateSerializer(serializers.Serializer):
    """Client updates bid status (shortlist, reject, ignore)."""

    status = serializers.ChoiceField(
        choices=['viewed', 'shortlisted', 'rejected', 'ignored', 'accepted']
    )
