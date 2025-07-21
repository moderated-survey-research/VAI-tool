from rest_framework import status, viewsets
from rest_framework.response import Response
from apps.user.permissions import IsSuperUser
from apps.survey.serializers.responses import (
    SurveyResponseSerializer,
    BasicSurveyResponseSerializer,
)
from apps.survey.serializers.requests import DispatchSurveyRequestSerializer
from apps.survey.services import SurveyService
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication


class SurveyViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperUser]

    _survey_service = SurveyService()

    def list(self, request: Request) -> Response:
        surveys = self._survey_service.all()
        response_serializer = BasicSurveyResponseSerializer(instance=surveys, many=True)
        return Response(data=response_serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request: Request, survey_id: str) -> Response:
        survey = self._survey_service.get(id=survey_id, get_or_404=True)
        response_serializer = SurveyResponseSerializer(instance=survey)
        return Response(data=response_serializer.data, status=status.HTTP_200_OK)

    def dispatch_emails(self, request: Request, survey_id: str) -> Response:
        survey = self._survey_service.get(id=survey_id, get_or_404=True)
        request_serializer = DispatchSurveyRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        self._survey_service.dispatch_emails(
            survey=survey, emails=request_serializer.validated_data["emails"]
        )
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)
