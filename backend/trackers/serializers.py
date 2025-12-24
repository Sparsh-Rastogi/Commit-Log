from rest_framework import serializers

from branches.models import Branch
from .models import Tracker, TrackerEntry


class TrackerSerializer(serializers.ModelSerializer):
    branchId = serializers.PrimaryKeyRelatedField(
        source="branch", queryset=Branch.objects.all(), write_only=True # to be set in view
    )
    class Meta:
        model = Tracker
        fields = [
            "id",
            "name",
            "branch",
            # "tracker_type",
            "branchId",
            "target_type",
            "target_value",
            "weight",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "is_active", "created_at"]


class TrackerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackerEntry
        fields = ["id", "value", "timestamp"]
        read_only_fields = ["id", "timestamp"]
