from rest_framework import serializers
from .models import Tracker, TrackerEntry


class TrackerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackerEntry
        fields = ["id", "value", "timestamp"]


class TrackerSerializer(serializers.ModelSerializer):
    entries = TrackerEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Tracker
        fields = "__all__"
