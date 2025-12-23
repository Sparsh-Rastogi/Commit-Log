from django.db.models import Sum
from django.utils.timezone import now
from datetime import timedelta


def get_tracker_current_value(tracker):
    if tracker.target_type == "VALUE":
        last_entry = tracker.entries.order_by("-timestamp").first()
        return last_entry.value if last_entry else 0

    if tracker.target_type == "SUM":
        since = now() - timedelta(days=7)
        return tracker.entries.filter(timestamp__gte=since).aggregate(
            Sum("value")
        )["value__sum"] or 0

    return 0
