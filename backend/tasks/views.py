from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Task
from .serializers import TaskSerializer
from branches.models import Branch
from rest_framework.decorators import api_view, permission_classes


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        branch_id = request.query_params.get("branch")
        print("Branch ID from query params:", branch_id)
        tasks = Task.objects.filter(branch__owner=request.user)

        if branch_id:
            tasks = tasks.filter(branch_id=branch_id)
        # print("Filtered Tasks:", tasks)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        print(request.data)
        print(serializer.validated_data)
        branch = Branch.objects.get(
            id=request.data.get("branchId"),
            owner=request.user,
        )

        task = serializer.save(branch=branch)
        print(task)
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_task(request, task_id):
    task = Task.objects.get(
        id=task_id,
        branch__owner=request.user,
    )

    task.completed = not task.completed
    task.save()

    return Response({
        "id": task.id,
        "completed": task.completed,
    })

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reschedule_task(request, task_id):
    task = Task.objects.get(
        id=task_id,
        branch__owner=request.user,
    )

    task.time_type = "SCHEDULED"
    task.scheduled_at = request.data.get("scheduled_at")

    task.start_at = None
    task.end_at = None
    task.recurring_rule = None

    task.save()

    return Response(TaskSerializer(task).data)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def remove_task_date(request, task_id):
    task = Task.objects.get(
        id=task_id,
        branch__owner=request.user,
    )

    task.time_type = "NONE"
    task.scheduled_at = None
    task.start_at = None
    task.end_at = None
    task.recurring_rule = None

    task.save()

    return Response(TaskSerializer(task).data)
