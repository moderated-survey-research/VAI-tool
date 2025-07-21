from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from apps.survey.serializers.responses import ResultResponseSerializer
from apps.survey.permissions import IsSubmissionAuthenticated
from apps.survey.authentication import SubmissionTokenAuthentication
from apps.survey.services import (
    SectionService,
    SubmissionService,
    ResultService,
    SummaryService,
    QuestionService,
    DiscussionService,
)
from .base import SubmissionAPIBaseViewSet
from apps.survey.request import SubmissionAPIRequest
from apps.survey.enums import SectionTypeEnum


class ResultViewSet(SubmissionAPIBaseViewSet):
    authentication_classes = [SubmissionTokenAuthentication]
    permission_classes = [IsSubmissionAuthenticated]

    _submission_service = SubmissionService()
    _section_service = SectionService()
    _result_service = ResultService()
    _summary_service = SummaryService()
    _question_service = QuestionService()
    _discussion_service = DiscussionService()

    @transaction.atomic
    def create(
        self, request: SubmissionAPIRequest, survey_id: str, section_id: int
    ) -> Response:
        section = self._section_service.get(
            id=section_id, submission=request.submission, get_or_404=True
        )
        previous_section = self._section_service.get_previous_section(
            submission=request.submission
        )
        if previous_section and previous_section.has_discussion:
            discussion_chat = self._discussion_service.get_discussion_chat(
                section=previous_section,
                submission=request.submission,
                get_or_404=True,
            )
            if not discussion_chat.is_closed:
                self._discussion_service.close_chat(
                    chat=discussion_chat, save_empty_final_note=True
                )
        result = self._result_service.create(
            submission=request.submission, section=section
        )
        upcoming_section = self._section_service.get_upcoming_section(
            submission=request.submission
        )
        current_activity = (
            section.questions.last()
            if section and section.type == SectionTypeEnum.QUESTIONNAIRE.value
            else section
        )
        if upcoming_section and upcoming_section.has_discussion:
            self._summary_service.update(
                current_activity=current_activity, submission=request.submission
            )
        elif (
            upcoming_section
            and upcoming_section.type == SectionTypeEnum.QUESTIONNAIRE.value
        ):
            upcoming_question = self._question_service.get_upcoming_question(
                section=upcoming_section, submission=request.submission
            )
            if upcoming_question and upcoming_question.has_follow_up:
                self._summary_service.update(
                    current_activity=current_activity, submission=request.submission
                )
        response_serializer = ResultResponseSerializer(instance=result)
        return Response(data=response_serializer.data, status=status.HTTP_200_OK)
