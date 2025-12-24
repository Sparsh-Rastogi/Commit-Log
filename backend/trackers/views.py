from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Tracker
from .serializers import TrackerSerializer
from .serializers import TrackerEntrySerializer
from branches.models import Branch


class TrackerListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        branch_id = request.query_params.get("branch")
        trackers = Tracker.objects.filter(branch__owner=request.user)
        print("Initial trackers:", trackers)
        if branch_id:
            trackers = trackers.filter(branch_id=branch_id)

        return Response(TrackerSerializer(trackers, many=True).data)

    def post(self, request):
        serializer = TrackerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        branch_id = request.data.get("branchId")
        branch = Branch.objects.get(id=branch_id, owner=request.user)
        tracker = serializer.save(branch=branch)

        return Response(TrackerSerializer(tracker).data, status=201)

from rest_framework.decorators import api_view, permission_classes
from .models import TrackerEntry
from .services import get_tracker_current_value

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def push_entry(request, tracker_id):
    tracker = Tracker.objects.get(
        id=tracker_id,
        branch__owner=request.user,
        is_active=True,
    )

    value = request.data.get("value")
    if value is None:
        return Response({"error": "value required"}, status=400)

    entry = TrackerEntry.objects.create(
        tracker=tracker,
        value=value,
    )

    # Handle threshold death
    if tracker.target_type == "THRESHOLD":
        current = get_tracker_current_value(tracker)
        if current >= tracker.target_value:
            tracker.is_active = False
            tracker.save()

    return Response({
        "entry": TrackerEntrySerializer(entry).data,
        "is_active": tracker.is_active,
    }, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tracker_entries(request, tracker_id):
    entries = TrackerEntry.objects.filter(
        tracker_id=tracker_id,
        tracker__branch__owner=request.user,
    ).order_by("-timestamp")

    return Response(TrackerEntrySerializer(entries, many=True).data)

from django.db.models import Avg, Max, Min

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tracker_analytics(request, tracker_id):
    qs = TrackerEntry.objects.filter(
        tracker_id=tracker_id,
        tracker__branch__owner=request.user,
    )

    return Response({
        "max": qs.aggregate(Max("value"))["value__max"],
        "min": qs.aggregate(Min("value"))["value__min"],
        "avg": qs.aggregate(Avg("value"))["value__avg"],
    })

from django.db.models.functions import TruncDate
from django.db.models import Sum

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tracker_heatmap(request, tracker_id):
    data = (
        TrackerEntry.objects
        .filter(tracker_id=tracker_id, tracker__branch__owner=request.user)
        .annotate(day=TruncDate("timestamp"))
        .values("day")
        .annotate(total=Sum("value"))
        .order_by("day")
    )

    return Response(list(data))
