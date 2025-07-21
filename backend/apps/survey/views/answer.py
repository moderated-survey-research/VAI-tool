from rest_framework import status
from rest_framework.response import Response
from apps.survey.serializers.requests import AnswerRequestSerializer
from apps.survey.serializers.responses import AnswerResponseSerializer
from apps.survey.permissions import IsSubmissionAuthenticated
from apps.survey.authentication import SubmissionTokenAuthentication
from apps.survey.services import (
    AnswerService,
    QuestionService,
    SubmissionService,
    SummaryService,
    SectionService,
    FollowUpService,
)
from apps.survey.enums import SubmissionStatusEnum
from .base import SubmissionAPIBaseViewSet
from apps.survey.request import SubmissionAPIRequest


class AnswerViewSet(SubmissionAPIBaseViewSet):
    authentication_classes = [SubmissionTokenAuthentication]
    permission_classes = [IsSubmissionAuthenticated]

    _submission_service = SubmissionService()
    _answer_service = AnswerService()
    _question_service = QuestionService()
    _section_service = SectionService()
    _summary_service = SummaryService()
    _follow_up_service = FollowUpService()

    def create(
        self,
        request: SubmissionAPIRequest,
        survey_id: str,
        section_id: int,
        question_id: int,
    ) -> Response:
        if request.submission.status != SubmissionStatusEnum.IN_PROGRESS:
            self._submission_service.update_status(
                submission=request.submission, status=SubmissionStatusEnum.IN_PROGRESS
            )
        section = self._section_service.get(
            id=section_id, submission=request.submission, get_or_404=True
        )
        question = self._question_service.get(
            id=question_id, survey=request.submission.survey, get_or_404=True
        )
        request_serializer = AnswerRequestSerializer(
            data=request.data, context={"question": question}
        )
        request_serializer.is_valid(raise_exception=True)
        previous_question = self._question_service.get_previous_question(
            section=section, submission=request.submission
        )
        if previous_question and previous_question.has_follow_up:
            follow_up_chat = self._follow_up_service.get_follow_up_chat(
                question=previous_question,
                submission=request.submission,
                get_or_404=True,
            )
            if not follow_up_chat.is_closed:
                self._follow_up_service.close_chat(
                    chat=follow_up_chat, save_empty_final_note=True
                )
        answer = self._answer_service.create(
            request_serializer=request_serializer,
            submission=request.submission,
            question=question,
        )
        upcoming_question = self._question_service.get_upcoming_question(
            section=section, submission=request.submission
        )
        if upcoming_question and upcoming_question.has_follow_up:
            self._summary_service.update(
                current_activity=question, submission=request.submission
            )
        response_serializer = AnswerResponseSerializer(instance=answer)
        return Response(data=response_serializer.data, status=status.HTTP_200_OK)
