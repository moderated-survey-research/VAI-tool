from rest_framework import status
from rest_framework.response import Response
from apps.survey.serializers.requests import (
    ClassicSurveyMessageRequestSerializer,
    AvatarSurveyMessageRequestSerializer,
    FinalNoteRequestSerializer,
)
from apps.survey.serializers.responses import MessageResponseSerializer
from apps.survey.permissions import IsSubmissionAuthenticated
from apps.survey.authentication import SubmissionTokenAuthentication
from apps.survey.services import SubmissionService, QuestionService, FollowUpService
from apps.survey.views.base import SubmissionAPIBaseViewSet
from apps.survey.request import SubmissionAPIRequest
from apps.survey.enums import SurveyTypeEnum


class FollowUpViewSet(SubmissionAPIBaseViewSet):
    authentication_classes = [SubmissionTokenAuthentication]
    permission_classes = [IsSubmissionAuthenticated]

    _question_service = QuestionService()
    _submission_service = SubmissionService()
    _follow_up_service = FollowUpService()

    def create(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        section_id: int,
        question_id: int,
    ) -> Response:
        match request.submission.survey.type:
            case SurveyTypeEnum.CLASSIC.value:
                return self._create_classic_survey(
                    request=request,
                    survey_id=survey_id,
                    section_id=section_id,
                    question_id=question_id,
                )
            case SurveyTypeEnum.AVATAR.value:
                return self._create_avatar_survey(
                    request=request,
                    survey_id=survey_id,
                    section_id=section_id,
                    question_id=question_id,
                )
            case _:
                return Response(data=None, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def _create_classic_survey(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        section_id: int,
        question_id: int,
    ) -> Response:
        question = self._question_service.get(
            id=question_id, survey=request.submission.survey, get_or_404=True
        )
        chat = self._follow_up_service.get_follow_up_chat(
            question=question, submission=request.submission, get_or_404=True
        )
        request_serializer = ClassicSurveyMessageRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        [user_message, assistant_message] = self._follow_up_service.answer_follow_up(
            answer=request_serializer, chat=chat
        )
        user_message_serializer = MessageResponseSerializer(instance=user_message)
        assistant_message_serializer = MessageResponseSerializer(
            instance=assistant_message
        )
        return Response(
            {
                "id": chat.id,
                "is_closed": chat.is_closed,
                "messages": [
                    user_message_serializer.data,
                    assistant_message_serializer.data,
                ],
            },
            status=status.HTTP_201_CREATED,
        )

    def _create_avatar_survey(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        section_id: int,
        question_id: int,
    ) -> Response:
        question = self._question_service.get(
            id=question_id, survey=request.submission.survey, get_or_404=True
        )
        chat = self._follow_up_service.get_follow_up_chat(
            question=question, submission=request.submission, get_or_404=True
        )
        request_serializer = AvatarSurveyMessageRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        message = self._follow_up_service.save_message(
            message=request_serializer, chat=chat
        )
        message_serializer = MessageResponseSerializer(instance=message)
        return Response(
            {
                "id": chat.id,
                "is_closed": chat.is_closed,
                "messages": [message_serializer.data],
            },
            status=status.HTTP_201_CREATED,
        )

    def close(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        section_id: int,
        question_id: int,
    ) -> Response:
        question = self._question_service.get(
            id=question_id, survey=request.submission.survey, get_or_404=True
        )
        chat = self._follow_up_service.get_follow_up_chat(
            question=question, submission=request.submission, get_or_404=True
        )
        self._follow_up_service.close_chat(chat=chat, save_empty_final_note=True)
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)

    def prompts(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        section_id: int,
        question_id: int,
    ) -> Response:
        question = self._question_service.get(
            id=question_id, survey=request.submission.survey, get_or_404=True
        )
        chat = self._follow_up_service.get_follow_up_chat(
            question=question, submission=request.submission, get_or_404=True
        )
        prompts = self._follow_up_service.get_prompts(chat=chat)
        return Response(data=prompts, status=status.HTTP_200_OK)

    def final_note(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        section_id: int,
        question_id: int,
    ) -> Response:
        question = self._question_service.get(
            id=question_id, survey=request.submission.survey, get_or_404=True
        )
        chat = self._follow_up_service.get_follow_up_chat(
            question=question, submission=request.submission, get_or_404=True
        )
        request_serializer = FinalNoteRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        self._follow_up_service.save_final_note(note=request_serializer, chat=chat)
        return Response(data=None, status=status.HTTP_204_NO_CONTENT)
