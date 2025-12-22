from django.urls import path
from .views import (
    TrackerListCreateView,
    TrackerPushView,
    TrackerAnalyticsView,
    TrackerHeatmapView,
)

urlpatterns = [
    path("branch/<int:branch_id>/", TrackerListCreateView.as_view()),
    path("<int:tracker_id>/push/", TrackerPushView.as_view()),
    path("<int:tracker_id>/analytics/", TrackerAnalyticsView.as_view()),
    path("<int:tracker_id>/heatmap/", TrackerHeatmapView.as_view()),
]
