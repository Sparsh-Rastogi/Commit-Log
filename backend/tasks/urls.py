from django.urls import path
from .views import (
    TaskListCreateView,
    TaskToggleView,
    TaskPostponeView,
)

urlpatterns = [
    path("branch/<int:branch_id>/", TaskListCreateView.as_view()),
    path("<int:task_id>/toggle/", TaskToggleView.as_view()),
    path("<int:task_id>/postpone/", TaskPostponeView.as_view()),
]
