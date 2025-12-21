from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "branch",
        "completed",
        "weight",
    )

    list_filter = ("completed", "branch")
    search_fields = ("title",)
