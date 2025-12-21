from django.contrib import admin
from .models import Tracker, TrackerEntry


@admin.register(Tracker)
class TrackerAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "branch",
        "weight",
        "is_active",
        "created_at",
    )

    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(TrackerEntry)
class TrackerEntryAdmin(admin.ModelAdmin):
    list_display = (
        "tracker",
        "value",
        "timestamp",
    )

    list_filter = ("tracker",)
