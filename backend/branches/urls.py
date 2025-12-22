from django.urls import path
from .views import BranchPullView

urlpatterns = [
    path("<int:branch_id>/pull/", BranchPullView.as_view()),
]
