from django.db import models
from django_stubs_ext.db.models import TypedModelMeta
from apps.survey.enums import ChatRole
from apps.common.models import TimeStamped
from .chat import Chat
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .chatsession import ChatSession


class MessageManager(models.Manager):
    """Custom manager that returns only unflagged messages by default."""

    def get_queryset(self):
        return super().get_queryset().filter(is_flagged=False)


class Message(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_messages"
        ordering = ["created_at"]

    role = models.CharField(
        max_length=50, choices=[(enum.value, enum.name) for enum in ChatRole]
    )
    content = models.TextField(max_length=1000)
    chat = models.ForeignKey(Chat, related_name="messages", on_delete=models.CASCADE)
    is_flagged = models.BooleanField(default=False)

    session: "ChatSession"

    objects = MessageManager()
    all_objects = models.Manager()  # To access all messages, including flagged ones
