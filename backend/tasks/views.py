from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Task
from .serializers import TaskSerializer
from branches.models import Branch


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id):
        tasks = Task.objects.filter(branch__id=branch_id, branch__owner=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, branch_id):
        branch = get_object_or_404(Branch, id=branch_id, owner=request.user)
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(branch=branch)
        return Response(serializer.data, status=201)
class TaskToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        task = get_object_or_404(
            Task,
            id=task_id,
            branch__owner=request.user
        )

        task.completed = not task.completed
        task.save()

        return Response({
            "id": task.id,
            "completed": task.completed
        })
from datetime import timedelta
from django.utils import timezone


class TaskPostponeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id, branch__owner=request.user)

        option = request.data.get("option")

        if task.scheduled_at is None:
            return Response({"error": "Task is not scheduled"}, status=400)

        if option == "tomorrow":
            task.scheduled_at += timedelta(days=1)
        elif option == "weekend":
            task.scheduled_at += timedelta(days=7)
        else:
            return Response({"error": "Invalid postpone option"}, status=400)

        task.save()
        return Response(TaskSerializer(task).data)
