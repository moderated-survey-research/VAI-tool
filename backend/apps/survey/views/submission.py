from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from apps.survey.serializers.responses import (
    SubmissionResponseSerializer,
    SubmissionAuthResponseSerializer,
)
from apps.survey.serializers.requests import (
    FingerprintRequestSerializer,
    GuidRequestSerializer,
)
from apps.survey.permissions import IsSubmissionAuthenticated
from apps.survey.authentication import SubmissionTokenAuthentication
from apps.survey.services import SubmissionService, SurveyService
from .base import SubmissionAPIBaseViewSet
from apps.survey.request import SubmissionAPIRequest
from django.conf import settings


class SubmissionViewSet(SubmissionAPIBaseViewSet):
    _survey_service = SurveyService()
    _submission_service = SubmissionService()

    def get_authenticators(self) -> list[BaseAuthentication]:
        authentication_classes = []
        action_map = {key.lower(): value for key, value in self.action_map.items()}
        action = action_map.get(self.request.method.lower())
        if action in ["retrieve", "complete", "exit", "privacy_consent_given"]:
            authentication_classes = [SubmissionTokenAuthentication]
        return [authentication() for authentication in authentication_classes]

    def get_permissions(self) -> list[BasePermission]:
        permission_classes = []
        if self.action in ["retrieve", "complete", "exit"]:
            permission_classes = [IsSubmissionAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request: SubmissionAPIRequest, survey_id: str) -> Response:
        survey = self._survey_service.get(id=survey_id, get_or_404=True)
        guid_request_serializer = GuidRequestSerializer(data=request.data)
        guid_request_serializer.is_valid(raise_exception=True)
        guid = guid_request_serializer.validated_data["guid"]
        fingerprint = None
        if settings.SURVEY_FINGERPRINT_ENABLED:
            fingerprint_request_serializer = FingerprintRequestSerializer(
                data=request.data
            )
            fingerprint_request_serializer.is_valid(raise_exception=True)
            fingerprint = fingerprint_request_serializer.validated_data["fingerprint"]
        submission = self._submission_service.create(
            survey=survey, fingerprint=fingerprint, guid=guid
        )
        response_serializer = SubmissionAuthResponseSerializer(instance=submission)
        return Response(data=response_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request: SubmissionAPIRequest, survey_id: str) -> Response:
        submission = self._submission_service.get(
            id=request.submission.id, get_or_404=True
        )
        response_serializer = SubmissionResponseSerializer(instance=submission)
        return Response(data=response_serializer.data, status=status.HTTP_200_OK)

    def complete(self, request: SubmissionAPIRequest, survey_id: str) -> Response:
        self._submission_service.complete(submission=request.submission)
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)

    def exit(self, request: SubmissionAPIRequest, survey_id: str) -> Response:
        self._submission_service.exit(submission=request.submission)
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)

    def privacy_consent_given(
        self, request: SubmissionAPIRequest, survey_id: str
    ) -> Response:
        submission = self._submission_service.get(
            id=request.submission.id, get_or_404=True
        )
        submission = self._submission_service.privacy_consent_given(
            submission=submission
        )
        return Response(
            data={
                "id": submission.id,
                "survey_id": submission.survey_id,
                "privacy_consent_given_at": submission.privacy_consent_given_at,
                "expires_at": submission.expires_at,
            },
            status=status.HTTP_200_OK,
        )
