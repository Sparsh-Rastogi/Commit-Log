from django.contrib import admin
from .models import Branch


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "owner",
        "base_xp",
        "is_main",
        "created_at",
    )

    list_filter = ("is_main", "created_at")
    search_fields = ("name", "owner__username")
    readonly_fields = ("created_at",)

    actions = ["pull_commit_admin"]

    @admin.action(description="Pull commit (award XP & delete)")
    def pull_commit_admin(self, request, queryset):
        for branch in queryset:
            branch.pull_commit()
