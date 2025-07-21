from typing import Self, Any, List
from apps.survey.models import Submission, Section, Chat, Result
from apps.survey.models import Message
from django.utils.translation import gettext as _
from apps.survey.agents import AgentFactory, SecurityAgent, DiscussionAgent
from apps.survey.enums import AgentID, ChatRole, ChatType
from apps.survey.services import SubmissionService, ChatSessionService
from django.conf import settings
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.contrib.admin.options import get_content_type_for_model
from apps.survey.serializers.requests import (
    ClassicSurveyMessageRequestSerializer,
    AvatarSurveyMessageRequestSerializer,
    FinalNoteRequestSerializer,
)
from django.db.models import Prefetch
from apps.survey.config import VIOLATION_RESPONSES
from django.utils import timezone


class DiscussionService:
    _instance = None

    _submission_service = SubmissionService()
    _chat_session_service = ChatSessionService()

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(DiscussionService, cls).__new__(cls)
        return cls._instance

    def close_chat(self: Self, chat: Chat, save_empty_final_note: bool = False) -> Chat:
        chat.is_closed = True
        chat.save()
        return (
            chat
            if not save_empty_final_note
            else self.save_final_note(note=None, chat=chat)
        )

    def get_discussion_chat(
        self: Self, section: Section, submission: Submission, get_or_404: bool = False
    ) -> Chat:
        section_ct = get_content_type_for_model(section)
        query = Chat.objects.filter(
            content_type=section_ct,
            object_id=section.id,
            submission=submission,
            type=ChatType.DISCUSSION.value,
        ).prefetch_related(
            "messages",
            "submission__summary",
            "content_object__survey",
            "content_object__questionnaire_section",
            Prefetch(
                "content_object__questionnaire_section__results",
                queryset=Result.objects.filter(submission=submission),
                to_attr="selected_results",
            ),
        )
        return get_object_or_404(query) if get_or_404 else query.get()

    def create_message(
        self: Self,
        message: ClassicSurveyMessageRequestSerializer,
        chat: Chat,
    ) -> List[Message]:
        if chat.is_closed:
            raise ValidationError(_("Chat has been closed."))
        discussion_agent: DiscussionAgent = AgentFactory.chat_agent(chat=chat)
        last_message = discussion_agent.messages[-1]
        if last_message and last_message["role"] != ChatRole.ASSISTANT.value:
            raise ValidationError(_("You can't send a message now."))
        last_message_model = chat.messages.last()
        security_agent: SecurityAgent = AgentFactory.base_agent(
            agent_id=AgentID.SECURITY,
            submission=chat.submission,
        )
        check = security_agent.check_answer(
            last_message["content"], message.validated_data["content"]
        )
        if not check:
            discussion_agent.save_flagged_message(message.validated_data["content"])
            self._submission_service.violation_detected(
                submission=chat.submission, raise_exception=True
            )

        messages = discussion_agent.generate_message(
            message=message.validated_data["content"]
        )
        user_message = messages[0]
        self._chat_session_service.message_answered(
            message=last_message_model, answered_at=user_message.created_at
        )
        if (
            discussion_agent.count_messages(role=ChatRole.ASSISTANT)
            == settings.SURVEY_DISCUSSION_THRESHOLD
        ):
            self.close_chat(chat)

        return messages

    def save_message(
        self: Self,
        message: AvatarSurveyMessageRequestSerializer,
        chat: Chat,
    ) -> List[Message]:
        discussion_agent: DiscussionAgent = AgentFactory.chat_agent(chat=chat)
        if (
            message.validated_data["role"] == ChatRole.ASSISTANT.value
            and message.validated_data["content"] in VIOLATION_RESPONSES
        ):
            discussion_agent.flag_last_user_message()
            self._submission_service.violation_detected(
                submission=chat.submission, raise_exception=True
            )
        message = discussion_agent.add_to_messages(
            role=ChatRole(message.validated_data["role"]),
            content=message.validated_data["content"],
        )
        last_assitant_message = chat.messages.filter(
            role=ChatRole.ASSISTANT.value
        ).last()
        if message.role == ChatRole.USER and last_assitant_message:
            self._chat_session_service.message_answered(
                message=last_assitant_message, answered_at=message.created_at
            )
        if (
            discussion_agent.count_messages(role=ChatRole.ASSISTANT)
            == settings.SURVEY_DISCUSSION_THRESHOLD
            and not chat.is_closed
        ):
            self.close_chat(chat)

        return message

    def get_prompts(self: Self, chat: Chat) -> dict:
        discussion_agent: DiscussionAgent = AgentFactory.chat_agent(chat=chat)
        return discussion_agent.get_prompts()

    def save_final_note(
        self: Self,
        note: FinalNoteRequestSerializer | None,
        chat: Chat,
    ) -> Chat:
        chat.final_note = note.validated_data["content"] if note else None
        chat.final_note_submitted_at = timezone.now()
        chat.save()
        return chat
