from django.urls import path
from .views import (
    TrackerListCreateView,
    push_entry,
    tracker_entries,
    tracker_analytics,
    tracker_heatmap,
)

urlpatterns = [
    path("", TrackerListCreateView.as_view()),
    path("<int:tracker_id>/push/", push_entry),
    path("<int:tracker_id>/entries/", tracker_entries),
    path("<int:tracker_id>/analytics/", tracker_analytics),
    path("<int:tracker_id>/heatmap/", tracker_heatmap),
]
