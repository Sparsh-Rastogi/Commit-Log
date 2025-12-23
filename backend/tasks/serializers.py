from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "branch",
            "completed",
            "weight",
            "time_type",
            "scheduled_at",
            "start_at",
            "end_at",
            "recurring_rule",
            "created_at",
        ]
        read_only_fields = ["id", "completed", "created_at"]

    def validate(self, data):
        time_type = data.get("time_type", "NONE")

        if time_type == "SCHEDULED" and not data.get("scheduled_at"):
            raise serializers.ValidationError("scheduled_at is required for SCHEDULED tasks")

        if time_type == "RANGE":
            if not data.get("start_at") or not data.get("end_at"):
                raise serializers.ValidationError("start_at and end_at are required for RANGE tasks")

        if time_type == "RECURRING" and not data.get("recurring_rule"):
            raise serializers.ValidationError("recurring_rule is required for RECURRING tasks")

        return data
