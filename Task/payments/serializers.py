from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Full payment serializer."""

    client_email = serializers.CharField(source='client.email', read_only=True)
    freelancer_email = serializers.CharField(source='freelancer.email', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'project', 'project_title',
            'client', 'client_email',
            'freelancer', 'freelancer_email',
            'amount', 'commission_rate', 'commission_amount',
            'net_amount', 'status', 'transaction_id',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'client', 'client_email', 'freelancer_email',
            'project_title', 'commission_rate', 'commission_amount',
            'net_amount', 'transaction_id', 'created_at', 'updated_at',
        ]


class PaymentCreateSerializer(serializers.Serializer):
    """Create a payment for a project."""

    project_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)


class PaymentActionSerializer(serializers.Serializer):
    """Release or refund payment."""

    action = serializers.ChoiceField(choices=['release', 'refund', 'dispute'])
