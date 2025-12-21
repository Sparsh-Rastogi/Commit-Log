from django.db import models
from branches.models import Branch


class Task(models.Model):
    TIME_TYPE_CHOICES = [
        ("NONE", "No Date"),
        ("SCHEDULED", "Scheduled"),
        ("RANGE", "Time Range"),
        ("RECURRING", "Recurring"),
    ]

    title = models.CharField(max_length=255)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="tasks")

    completed = models.BooleanField(default=False)
    weight = models.PositiveIntegerField(default=1)

    time_type = models.CharField(max_length=20, choices=TIME_TYPE_CHOICES, default="NONE")

    scheduled_at = models.DateTimeField(null=True, blank=True)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)

    recurring_rule = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
