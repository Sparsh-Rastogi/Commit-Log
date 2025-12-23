from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Branch
from .serializers import BranchSerializer
from rest_framework.decorators import api_view, permission_classes


class BranchListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        branches = Branch.objects.filter(owner=request.user).order_by("created_at")
        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BranchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        branch = serializer.save(owner=request.user)
        return Response(
            BranchSerializer(branch).data,
            status=status.HTTP_201_CREATED,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pull_branch(request, branch_id):
    branch = Branch.objects.get(id=branch_id, owner=request.user)

    result = branch.pull_commit()

    return Response({
        "score": result["score"],
        "xpEarned": result["xp_earned"],
        "newXp": request.user.xp,
        "newLevel": request.user.level,
        "leveledUp": result["leveled_up"],
    })
