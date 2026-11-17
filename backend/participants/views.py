
from rest_framework import permissions, serializers, viewsets

from .models import Registration
from .serializers import RegistrationSerializer


class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return (
            Registration.objects
            .filter(event__organizer__user=self.request.user)
            .select_related("event", "participant")
        )

    def validate_event_ownership(self, event):
        if event.organizer.user_id != self.request.user.id:
            raise serializers.ValidationError({
                "event": "Você não tem permissão para gerenciar inscrições deste evento."
            })

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        self.validate_event_ownership(event)
        serializer.save()

    def perform_update(self, serializer):
        event = serializer.validated_data.get(
            "event",
            serializer.instance.event
        )
        self.validate_event_ownership(event)
        serializer.save()
