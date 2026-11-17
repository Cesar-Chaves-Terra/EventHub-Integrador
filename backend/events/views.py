
from django.db import transaction
from django.db.models import Count
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import EventSerializer
from .models import Event


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "registration_counts"]:
            return [permissions.AllowAny()]

        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Event.objects.all()

        if self.action in ["update", "partial_update", "destroy"]:
            return queryset.filter(
                organizer__user=self.request.user
            )

        return queryset

    def perform_create(self, serializer):
        organizer = self.request.user.organizer_profile
        capacity = serializer.validated_data["capacity"]

        serializer.save(
            organizer=organizer,
            available_seats=capacity
        )

    def perform_update(self, serializer):
        with transaction.atomic():
            event = Event.objects.select_for_update().get(
                pk=serializer.instance.pk,
                organizer__user=self.request.user
            )

            active_registrations = event.registrations.filter(
                status="ACTIVE"
            ).count()

            new_capacity = serializer.validated_data.get(
                "capacity",
                event.capacity
            )

            if new_capacity < active_registrations:
                raise serializers.ValidationError({
                    "capacity": (
                        "A capacidade não pode ser menor que "
                        "o número de inscrições ativas."
                    )
                })

            serializer.save(
                available_seats=new_capacity - active_registrations
            )

    @action(
        detail=False,
        methods=["get"],
        url_path="registration-counts"
    )
    def registration_counts(self, request):
        events = Event.objects.annotate(
            registration_count=Count("registrations")
        ).values("id", "name", "registration_count")

        return Response(events)
