from typing import Self, Any, List
from apps.survey.models import Submission, Question, Chat, Answer
from apps.survey.models import Message
from django.utils.translation import gettext as _
from apps.survey.agents import AgentFactory, SecurityAgent, FollowUpAgent
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


class FollowUpService:
    _instance = None

    _submission_service = SubmissionService()
    _chat_session_service = ChatSessionService()

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(FollowUpService, cls).__new__(cls)
        return cls._instance

    def close_chat(self: Self, chat: Chat, save_empty_final_note: bool = False) -> Chat:
        chat.is_closed = True
        chat.save()
        return (
            chat
            if not save_empty_final_note
            else self.save_final_note(note=None, chat=chat)
        )

    def get_follow_up_chat(
        self: Self, question: Question, submission: Submission, get_or_404: bool = False
    ) -> Chat:
        question_ct = get_content_type_for_model(question)
        query = Chat.objects.filter(
            content_type=question_ct,
            object_id=question.id,
            submission=submission,
            type=ChatType.FOLLOW_UP.value,
        ).prefetch_related(
            Prefetch(
                "content_object__answers",
                queryset=Answer.objects.filter(submission=submission).prefetch_related(
                    "choices"
                ),
                to_attr="selected_answers",
            ),
            "content_object__options",
            "content_object__scale",
            "content_object__section__survey",
            "submission__summary",
            "messages",
        )
        return get_object_or_404(query) if get_or_404 else query.get()

    def answer_follow_up(
        self: Self,
        answer: ClassicSurveyMessageRequestSerializer,
        chat: Chat,
    ) -> List[Message]:
        if chat.is_closed:
            raise ValidationError(_("Chat has been closed."))
        follow_up_agent: FollowUpAgent = AgentFactory.chat_agent(chat=chat)
        last_follow_up = follow_up_agent.messages[-1]
        last_follow_up_model = chat.messages.last()
        security_agent: SecurityAgent = AgentFactory.base_agent(
            agent_id=AgentID.SECURITY,
            submission=chat.submission,
        )
        check = security_agent.check_answer(
            last_follow_up["content"], answer.validated_data["content"]
        )
        if not check:
            follow_up_agent.save_flagged_message(answer.validated_data["content"])
            self._submission_service.violation_detected(
                submission=chat.submission, raise_exception=True
            )

        messages = follow_up_agent.generate_follow_up(
            answer=answer.validated_data["content"]
        )
        user_message = messages[0]
        self._chat_session_service.message_answered(
            message=last_follow_up_model, answered_at=user_message.created_at
        )
        if (
            follow_up_agent.count_messages(role=ChatRole.ASSISTANT)
            == settings.SURVEY_FOLLOW_UP_THRESHOLD
        ):
            self.close_chat(chat)

        return messages

    def save_message(
        self: Self,
        message: AvatarSurveyMessageRequestSerializer,
        chat: Chat,
    ) -> Message:
        follow_up_agent: FollowUpAgent = AgentFactory.chat_agent(chat=chat)
        if (
            message.validated_data["role"] == ChatRole.ASSISTANT.value
            and message.validated_data["content"] in VIOLATION_RESPONSES
        ):
            follow_up_agent.flag_last_user_message()
            self._submission_service.violation_detected(
                submission=chat.submission, raise_exception=True
            )
        message = follow_up_agent.add_to_messages(
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
            follow_up_agent.count_messages(role=ChatRole.ASSISTANT)
            == settings.SURVEY_FOLLOW_UP_THRESHOLD
            and not chat.is_closed
        ):
            self.close_chat(chat)

        return message

    def get_prompts(self: Self, chat: Chat) -> dict:
        follow_up_agent: FollowUpAgent = AgentFactory.chat_agent(chat=chat)
        return follow_up_agent.get_prompts()

    def save_final_note(
        self: Self,
        note: FinalNoteRequestSerializer | None,
        chat: Chat,
    ) -> Chat:
        chat.final_note = note.validated_data["content"] if note else None
        chat.final_note_submitted_at = timezone.now()
        chat.save()
        return chat
