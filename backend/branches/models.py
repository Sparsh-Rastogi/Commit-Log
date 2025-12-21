from django.db import models
from accounts.models import User

class Branch(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="branches")
    is_main = models.BooleanField(default=False)
    base_xp = models.PositiveIntegerField(default=100)  # XP attached to the commit
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

    def calculate_commit_score(self):
        """Calculate commit score based on tasks and trackers"""
        tasks = self.tasks.all()
        trackers = self.trackers.all()

        total_weight = sum(t.weight for t in tasks) + sum(tr.weight for tr in trackers)
        if total_weight == 0:
            return 0

        completed_task_weight = sum(t.weight for t in tasks if t.completed)
        tracker_contribution = sum(tr.get_contribution() for tr in trackers)  # implement get_contribution in Tracker
        score_percentage = (completed_task_weight + tracker_contribution) / total_weight * 100
        return score_percentage

    def pull_commit(self):
        """Mark commit as completed, award XP to user, and delete itself"""
        score_percent = self.calculate_commit_score()
        earned_xp = int(self.base_xp * score_percent / 100)
        self.owner.add_xp(earned_xp)
        self.delete()
