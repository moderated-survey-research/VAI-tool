from rest_framework import status
from rest_framework.response import Response
from apps.survey.serializers.responses import SectionResponseSerializer
from apps.survey.permissions import IsSubmissionAuthenticated
from apps.survey.authentication import SubmissionTokenAuthentication
from apps.survey.services import SectionService, SurveyService
from .base import SubmissionAPIBaseViewSet
from apps.survey.request import SubmissionAPIRequest


class SectionViewSet(SubmissionAPIBaseViewSet):
    authentication_classes = [SubmissionTokenAuthentication]
    permission_classes = [IsSubmissionAuthenticated]

    _survey_service = SurveyService()
    _section_service = SectionService()

    def retrieve(
        self, request: SubmissionAPIRequest, survey_id: str, section_id: int
    ) -> Response:
        section = self._section_service.get(
            id=section_id, submission=request.submission, get_or_404=True
        )
        response_serializer = SectionResponseSerializer(
            instance=section, context={"submission": request.submission}
        )
        return Response(data=response_serializer.data, status=status.HTTP_200_OK)
