from typing import Self, Any
from apps.survey.models import ChatSession, Message, Submission
from django.utils import timezone
from django.shortcuts import get_object_or_404
from apps.survey.enums import ChatRole


class ChatSessionService:
    _instance = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(ChatSessionService, cls).__new__(cls)
        return cls._instance

    def get_message(
        self, submission: Submission, chat_id: int, message_id: int
    ) -> Message:
        query = Message.objects.filter(
            chat_id=chat_id, chat__submission=submission, role=ChatRole.ASSISTANT.value
        ).prefetch_related("session")
        return get_object_or_404(query, id=message_id)

    def message_asked(
        self,
        message: Message,
    ) -> ChatSession:
        session = getattr(message, "session", None)
        if not session:
            session = ChatSession.objects.create(
                message=message,
                asked_at=timezone.now(),
            )
        elif not session.asked_at:
            session.asked_at = timezone.now()
            session.save()

        return session

    def started_answering_message(
        self,
        message: Message,
    ) -> ChatSession:
        session = getattr(message, "session", None)
        if not session:
            session = ChatSession.objects.create(
                message=message,
                asked_at=timezone.now(),
                started_answering_at=timezone.now(),
            )
        elif not session.started_answering_at:
            session.started_answering_at = timezone.now()
            session.save()

        return session

    def message_answered(
        self,
        message: Message,
        answered_at: timezone.datetime | None = None,
    ) -> ChatSession:
        session = getattr(message, "session", None)
        if not session:
            session = ChatSession.objects.create(
                message=message,
                asked_at=timezone.now(),
                started_answering_at=timezone.now(),
                ended_answering_at=answered_at or timezone.now(),
            )
        elif not session.ended_answering_at:
            session.ended_answering_at = answered_at or timezone.now()
            session.save()

        return session
