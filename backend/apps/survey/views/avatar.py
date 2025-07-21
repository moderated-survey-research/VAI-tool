from rest_framework import status
from rest_framework.response import Response
from apps.survey.permissions import IsSubmissionAuthenticated
from apps.survey.authentication import SubmissionTokenAuthentication
from .base import SubmissionAPIBaseViewSet
from apps.survey.request import SubmissionAPIRequest
from apps.survey.clients import HeyGenClient
from apps.survey.services import SubmissionService


class AvatarViewSet(SubmissionAPIBaseViewSet):
    authentication_classes = [SubmissionTokenAuthentication]
    permission_classes = [IsSubmissionAuthenticated]

    _heygen_client = HeyGenClient()
    _submission_service = SubmissionService()

    def token(self, request: SubmissionAPIRequest, survey_id: str) -> Response:
        token = self._heygen_client.get_access_token()
        return Response(data={"token": token}, status=status.HTTP_201_CREATED)

    def set_avatar(
        self, request: SubmissionAPIRequest, survey_id: str, avatar_id: str
    ) -> Response:
        self._submission_service.set_avatar(
            submission=request.submission, avatar_id=avatar_id
        )
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)
