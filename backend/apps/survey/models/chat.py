from django.db import models
from django_stubs_ext.db.models import TypedModelMeta
from apps.common.models import TimeStamped
from apps.survey.enums import AgentID, ChatType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .submission import Submission
from django.db.models import Manager
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .message import Message
    from .chatsession import ChatSession


class Chat(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_chats"

    agent_id = models.CharField(
        max_length=50, choices=[(enum.value, enum.name) for enum in AgentID]
    )
    type = models.CharField(
        max_length=50, choices=[(enum.value, enum.name) for enum in ChatType]
    )
    required_messages_count = models.IntegerField(null=True, blank=True)
    is_required = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    final_note = models.TextField(null=True, blank=True, max_length=1000)
    final_note_submitted_at = models.DateTimeField(null=True, blank=True)

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")
    submission = models.ForeignKey(
        Submission, related_name="chats", on_delete=models.CASCADE
    )

    messages: Manager["Message"]
    sessions: Manager["ChatSession"]
