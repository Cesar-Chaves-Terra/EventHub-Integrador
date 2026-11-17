
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction

from rest_framework import (
    mixins,
    permissions,
    serializers,
    viewsets,
)

from .models import Participant, Registration
from .serializers import (
    ParticipantSerializer,
    RegistrationSerializer,
)


class ParticipantViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Participant.objects.filter(
                registrations__event__organizer__user=self.request.user
            )
            .distinct()
            .order_by("name")
        )


class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Registration.objects.filter(
                event__organizer__user=self.request.user
            )
            .select_related("event", "participant")
        )

    def validate_event_ownership(self, event):
        if event.organizer.user_id != self.request.user.id:
            raise serializers.ValidationError({
                "event": (
                    "Você não tem permissão para gerenciar "
                    "inscrições deste evento."
                )
            })

    def save_registration(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()

        except DjangoValidationError as exc:
            raise serializers.ValidationError({
                "detail": exc.messages
            }) from exc

        except IntegrityError as exc:
            raise serializers.ValidationError({
                "detail": (
                    "Não foi possível salvar a inscrição. "
                    "Verifique se o participante já está "
                    "inscrito neste evento."
                )
            }) from exc

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]

        self.validate_event_ownership(event)

        self.save_registration(serializer)

    def perform_update(self, serializer):
        event = serializer.validated_data.get(
            "event",
            serializer.instance.event
        )

        self.validate_event_ownership(event)

        if event.pk != serializer.instance.event_id:
            raise serializers.ValidationError({
                "event": (
                    "Não é possível transferir uma inscrição "
                    "para outro evento."
                )
            })

        participant = serializer.validated_data.get(
            "participant",
            serializer.instance.participant
        )

        if participant.pk != serializer.instance.participant_id:
            raise serializers.ValidationError({
                "participant": (
                    "Não é possível alterar o participante "
                    "de uma inscrição existente."
                )
            })

        self.save_registration(serializer)
