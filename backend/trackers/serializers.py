from rest_framework import serializers
from .models import Tracker, TrackerEntry


class TrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tracker
        fields = [
            "id",
            "name",
            "branch",
            "tracker_type",
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
