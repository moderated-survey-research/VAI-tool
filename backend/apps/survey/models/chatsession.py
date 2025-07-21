from django.db import models
from django_stubs_ext.db.models import TypedModelMeta
from apps.common.models import TimeStamped
from .chat import Chat
from .message import Message


class ChatSession(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_chat_sessions"

    asked_at = models.DateTimeField()
    started_answering_at = models.DateTimeField(null=True, blank=True)
    ended_answering_at = models.DateTimeField(null=True, blank=True)

    message = models.OneToOneField(
        Message, related_name="session", on_delete=models.CASCADE
    )
