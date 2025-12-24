from django.db import models
from branches.models import Branch


class Tracker(models.Model):
    TRACKER_TYPE_CHOICES = [
        ("PLAIN", "Plain"),
        ("INCREMENT", "Incrementing"),
        ("DECREMENT", "Decrementing"),
    ]

    TARGET_TYPE_CHOICES = [
        ("NONE", "No Target"),
        ("VALUE", "Value"),
        ("SUM", "Sum"),
        ("THRESHOLD", "Threshold"),
    ]

    name = models.CharField(max_length=255)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, default=None, related_name="trackers")

    tracker_type = models.CharField(max_length=20, choices=TRACKER_TYPE_CHOICES, default="PLAIN")
    target_type = models.CharField(max_length=20, choices=TARGET_TYPE_CHOICES, default="NONE")

    target_value = models.FloatField(null=True, blank=True)
    weight = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TrackerEntry(models.Model):
    tracker = models.ForeignKey(Tracker, on_delete=models.CASCADE, related_name="entries")
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tracker.name}: {self.value}"
