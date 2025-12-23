from django.urls import path
from .views import (
    TaskListCreateView,
    toggle_task,
    reschedule_task,
    remove_task_date,
)

urlpatterns = [
    path("", TaskListCreateView.as_view()),
    path("<int:task_id>/toggle/", toggle_task),
    path("<int:task_id>/reschedule/", reschedule_task),
    path("<int:task_id>/remove-date/", remove_task_date),
]
