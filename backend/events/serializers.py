
from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    organizer = serializers.StringRelatedField(read_only=True)
    available_seats = serializers.IntegerField(read_only=True)
    can_manage = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "description",
            "date",
            "capacity",
            "available_seats",
            "organizer",
            "can_manage",
        ]

    def get_can_manage(self, obj):
        request = self.context.get("request")

        if request is None or not request.user.is_authenticated:
            return False

        return obj.organizer.user_id == request.user.id
