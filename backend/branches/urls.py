from django.urls import path
from .views import BranchListCreateView, pull_branch

urlpatterns = [
    path("", BranchListCreateView.as_view()),
    path("<int:branch_id>/pull/", pull_branch),
]
