from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Branch


class BranchPullView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, branch_id):
        branch = get_object_or_404(
            Branch,
            id=branch_id,
            owner=request.user,
            is_main=False
        )

        score = branch.calculate_commit_score()  # 0.0 → 1.0
        earned_xp = int(branch.base_xp * score)

        # 🔥 THIS is the only XP call you need
        request.user.add_xp(earned_xp)

        branch.delete()

        return Response({
            "branch": branch.name,
            "commit_score": round(score * 100, 2),
            "xp_earned": earned_xp,
            "new_level": request.user.level,
            "xp_to_next_level": request.user.next_level_xp() - request.user.xp,
        })
