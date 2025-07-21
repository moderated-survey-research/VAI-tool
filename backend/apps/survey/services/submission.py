from typing import Self, Any
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from apps.survey.models import (
    Submission,
    Answer,
    Survey,
    Result,
    Chat,
    Question,
    Message,
    Section,
    Summary,
)
from apps.survey.enums import SubmissionStatusEnum, SurveyTypeEnum
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.utils.translation import gettext as _
from apps.survey.config import AVATARS
from django.conf import settings
import apps.survey.constants.errorcodes as ERROR_CODES
from apps.survey.enums import ChatType, ChatRole
from django.contrib.admin.options import get_content_type_for_model
from apps.survey.config import FOLLOW_UPS, DISCUSSIONS
from apps.survey.exceptions import DuplicateSurveySubmissionException
from apps.survey.clients import HeyGenClient
from django.utils import timezone


class SubmissionService:
    _instance = None

    _heygen_client = HeyGenClient()

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(SubmissionService, cls).__new__(cls)
        return cls._instance

    def get(self: Self, id: int, get_or_404: bool = False) -> Submission:
        query = Submission.objects.prefetch_related(
            Prefetch(
                "survey__sections__questionnaire_section__results",
                queryset=Result.objects.filter(submission=id),
                to_attr="selected_results",
            ),
            Prefetch(
                "survey__sections__results",
                queryset=Result.objects.filter(submission=id),
                to_attr="selected_results",
            ),
            Prefetch(
                "survey__sections__chats",
                queryset=Chat.objects.filter(
                    submission=id, type=ChatType.DISCUSSION.value
                ).prefetch_related("messages"),
                to_attr="discussion_chats",
            ),
            Prefetch(
                "survey__sections__questions__answers",
                queryset=Answer.objects.filter(submission=id).prefetch_related(
                    "choices"
                ),
                to_attr="selected_answers",
            ),
            Prefetch(
                "survey__sections__questions__chats",
                queryset=Chat.objects.filter(
                    submission=id, type=ChatType.FOLLOW_UP.value
                ).prefetch_related("messages"),
                to_attr="follow_up_chats",
            ),
            "survey__sections__questions__options",
            "survey__sections__questions__scale",
        )
        return get_object_or_404(query, id=id) if get_or_404 else query.get(id=id)

    def _create_summary(self: Self, submission: Submission):
        Summary.objects.create(submission=submission)

    def _create_chats(self: Self, submission: Submission):
        question_ct = get_content_type_for_model(Question)
        section_ct = get_content_type_for_model(Section)
        follow_up_questions = Question.objects.filter(
            section__survey=submission.survey, has_follow_up=True
        )
        discussion_sections = Section.objects.filter(
            survey=submission.survey, has_discussion=True
        )
        first_discussion_section = discussion_sections.first()
        follow_up_chats = [
            Chat(
                submission=submission,
                agent_id=FOLLOW_UPS.get(question.key, FOLLOW_UPS.get("default"))[
                    "agent_id"
                ],
                content_type=question_ct,
                object_id=question.id,
                type=ChatType.FOLLOW_UP.value,
                is_required=True,
                required_messages_count=None,
            )
            for question in follow_up_questions
        ]
        discussion_chats = [
            Chat(
                submission=submission,
                agent_id=DISCUSSIONS.get(section.key, DISCUSSIONS.get("default"))[
                    "agent_id"
                ],
                content_type=section_ct,
                object_id=section.id,
                type=ChatType.DISCUSSION.value,
                is_required=(
                    True if section.id == first_discussion_section.id else False
                ),
                required_messages_count=(
                    1 if section.id == first_discussion_section.id else None
                ),
            )
            for section in discussion_sections
        ]
        created_follow_up_chats = Chat.objects.bulk_create(follow_up_chats)
        created_discussion_chats = Chat.objects.bulk_create(discussion_chats)
        follow_up_messages = [
            Message(
                chat=chat,
                content=FOLLOW_UPS.get(question.key, FOLLOW_UPS.get("default"))[
                    "content"
                ],
                role=ChatRole.ASSISTANT.value,
            )
            for chat, question in zip(created_follow_up_chats, follow_up_questions)
        ]
        discussion_messages = [
            Message(
                chat=chat,
                content=DISCUSSIONS.get(section.key, DISCUSSIONS.get("default"))[
                    "content"
                ],
                role=ChatRole.ASSISTANT.value,
            )
            for chat, section in zip(created_discussion_chats, discussion_sections)
        ]
        Message.objects.bulk_create(follow_up_messages)
        Message.objects.bulk_create(discussion_messages)

    def create(
        self: Self, survey: Survey, fingerprint: str | None, guid: str | None
    ) -> Submission:
        if settings.SURVEY_FINGERPRINT_ENABLED:
            is_duplicate = Submission.objects.filter(
                survey=survey, fingerprint=fingerprint
            ).exists()
            if is_duplicate:
                raise DuplicateSurveySubmissionException()
        submission = Submission.objects.create(
            survey=survey, fingerprint=fingerprint, guid=guid
        )
        self._create_chats(submission)
        self._create_summary(submission)
        return submission

    def update_status(
        self: Self, submission: Submission, status: SubmissionStatusEnum
    ) -> Submission:
        submission.status = status.value
        submission.save()
        return submission

    def complete(self: Self, submission: Submission) -> Submission:
        if submission.status == SubmissionStatusEnum.COMPLETED.value:
            raise ValidationError(_("Submission is already completed."))
        required_sections = submission.survey.sections.filter(is_required=True)
        results = submission.results.filter(section__in=required_sections)
        if required_sections.count() != results.count():
            raise ValidationError(
                _("All required sections must be completed before proceeding.")
            )
        return self.update_status(
            submission=submission, status=SubmissionStatusEnum.COMPLETED
        )

    def exit(self: Self, submission: Submission) -> Submission:
        if submission.status == SubmissionStatusEnum.EXITED.value:
            raise ValidationError(_("Submission is already exited."))
        return self.update_status(
            submission=submission, status=SubmissionStatusEnum.EXITED
        )

    def set_avatar(self: Self, submission: Submission, avatar_id: str) -> Submission:
        available_avatars = [avatar["pose_id"] for avatar in AVATARS]
        if avatar_id not in available_avatars:
            raise ValidationError(_("Selected avatar is invalid or unavailable."))
        submission.avatar_id = avatar_id
        submission.save()
        return submission

    def violation_detected(
        self: Self, submission: Submission, raise_exception: bool = True
    ) -> Submission:
        submission.violation_count += 1
        submission.save()
        # if submission.violation_count >= settings.SURVEY_VIOLATION_THRESHOLD:
        #     self.update_status(
        #         submission=submission, status=SubmissionStatusEnum.TERMINATED
        #     )
        #     if raise_exception:
        #         raise PermissionDenied(
        #             _(
        #                 "Your survey was closed due to repeated invalid responses. Thank you for your time."
        #             ),
        #             code=ERROR_CODES.SURVEY_TERMINATION,
        #         )
        if raise_exception:
            raise PermissionDenied(
                _(
                    "I didn't quite get that. Try to be more verbose and keep it on point."
                ),
                code=ERROR_CODES.SURVEY_VIOLATION,
            )

        return submission

    def privacy_consent_given(self: Self, submission: Submission) -> Submission:
        if not submission.privacy_consent_given_at is not None:
            submission.privacy_consent_given_at = timezone.now()
            submission.save()
        return submission
