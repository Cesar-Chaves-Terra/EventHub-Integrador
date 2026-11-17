
from rest_framework.routers import DefaultRouter

from .views import ParticipantViewSet, RegistrationViewSet


router = DefaultRouter()

router.register(
    "participants",
    ParticipantViewSet,
    basename="participant",
)

router.register(
    "registrations",
    RegistrationViewSet,
    basename="registration",
)

urlpatterns = router.urls
