from django.db import models
from django_stubs_ext.db.models import TypedModelMeta
from .section import Section
from .scale import Scale
from apps.survey.enums import QuestionTypeEnum
from django.db.models import Manager
from apps.common.models import TimeStamped
from typing import TYPE_CHECKING
from django.contrib.contenttypes.fields import GenericRelation
from .chat import Chat

if TYPE_CHECKING:
    from .answer import Answer
    from .option import Option


class Question(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_questions"
        constraints = [
            models.UniqueConstraint(
                fields=["order", "section_id"],
                name="survey_questions_order_section_id_unique",
            ),
            models.UniqueConstraint(
                fields=["key"],
                name="survey_questions_key_unique",
            ),
        ]
        ordering = ["order"]

    key = models.CharField(max_length=50)
    preheading = models.TextField(max_length=500, null=True, blank=True)
    content = models.TextField(max_length=500)
    subheading = models.TextField(max_length=500, null=True, blank=True)
    type = models.CharField(
        max_length=50, choices=[(enum.value, enum.name) for enum in QuestionTypeEnum]
    )
    order = models.PositiveSmallIntegerField()
    is_required = models.BooleanField(default=True)
    is_attention_check = models.BooleanField(default=False)
    has_follow_up = models.BooleanField(default=False)
    requires_explanation = models.BooleanField(default=False)

    section = models.ForeignKey(
        Section, related_name="questions", on_delete=models.CASCADE
    )
    scale = models.ForeignKey(
        Scale,
        related_name="questions",
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
    )
    chats = GenericRelation(Chat, related_query_name="questions")

    answers: Manager["Answer"]
    options: Manager["Option"]
