from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Tracker, TrackerEntry
from .serializers import TrackerSerializer
from branches.models import Branch
from django.db.models import Avg, Max, Min, Sum
from collections import defaultdict
from datetime import timedelta
from django.utils import timezone


class TrackerListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id):
        trackers = Tracker.objects.filter(branch__id=branch_id, branch__owner=request.user)
        serializer = TrackerSerializer(trackers, many=True)
        return Response(serializer.data)

    def post(self, request, branch_id):
        branch = get_object_or_404(Branch, id=branch_id, owner=request.user)
        serializer = TrackerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(branch=branch)
        return Response(serializer.data, status=201)

class TrackerPushView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tracker_id):
        tracker = get_object_or_404(
            Tracker,
            id=tracker_id,
            branch__owner=request.user,
            is_active=True
        )

        value = float(request.data.get("value", 0))

        TrackerEntry.objects.create(tracker=tracker, value=value)

        # Threshold logic
        if tracker.target_type == "THRESHOLD":
            total = sum(e.value for e in tracker.entries.all())
            if total >= tracker.target_value:
                tracker.is_active = False
                tracker.weight = 0
                tracker.save()

        return Response({"detail": "Entry added"})



class TrackerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tracker_id):
        tracker = get_object_or_404(
            Tracker,
            id=tracker_id,
            branch__owner=request.user
        )

        entries = tracker.entries.all()

        data = {
            "sum": entries.aggregate(Sum("value"))["value__sum"] or 0,
            "max": entries.aggregate(Max("value"))["value__max"] or 0,
            "min": entries.aggregate(Min("value"))["value__min"] or 0,
            "avg": entries.aggregate(Avg("value"))["value__avg"] or 0,
        }

        return Response(data)



class TrackerHeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tracker_id):
        tracker = get_object_or_404(
            Tracker,
            id=tracker_id,
            branch__owner=request.user
        )

        heatmap = defaultdict(int)

        for entry in tracker.entries.all():
            day = entry.timestamp.date().isoformat()
            heatmap[day] += entry.value

        return Response(heatmap)

