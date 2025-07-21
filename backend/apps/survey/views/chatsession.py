from rest_framework import status
from rest_framework.response import Response
from apps.survey.permissions import IsSubmissionAuthenticated
from apps.survey.authentication import SubmissionTokenAuthentication
from apps.survey.services import ChatSessionService
from apps.survey.views.base import SubmissionAPIBaseViewSet
from apps.survey.request import SubmissionAPIRequest


class ChatSessionViewSet(SubmissionAPIBaseViewSet):
    authentication_classes = [SubmissionTokenAuthentication]
    permission_classes = [IsSubmissionAuthenticated]

    _chat_session_service = ChatSessionService()

    def message_asked(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        chat_id: int,
        message_id: int,
    ) -> Response:
        message = self._chat_session_service.get_message(
            submission=request.submission, chat_id=chat_id, message_id=message_id
        )
        self._chat_session_service.message_asked(message=message)
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)

    def started_answering_message(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        chat_id: int,
        message_id: int,
    ) -> Response:
        message = self._chat_session_service.get_message(
            submission=request.submission, chat_id=chat_id, message_id=message_id
        )
        self._chat_session_service.started_answering_message(message=message)
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)
