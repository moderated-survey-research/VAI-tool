from django.db import models
from django_stubs_ext.db.models import TypedModelMeta
from .survey import Survey
from apps.survey.enums import SectionTypeEnum
from django.db.models import Manager
from apps.common.models import TimeStamped
from typing import TYPE_CHECKING
from django.contrib.contenttypes.fields import GenericRelation
from .chat import Chat

if TYPE_CHECKING:
    from .question import Question
    from .result import Result


class Section(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_sections"
        constraints = [
            models.UniqueConstraint(
                fields=["order", "survey_id"],
                name="survey_sections_order_survey_id_unique",
            ),
            models.UniqueConstraint(
                fields=["key"],
                name="survey_sections_key_unique",
            ),
        ]
        ordering = ["order"]

    key = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    subtitle = models.TextField(max_length=500, null=True, blank=True)
    content = models.TextField(max_length=500, null=True, blank=True)
    type = models.CharField(
        max_length=50, choices=[(enum.value, enum.name) for enum in SectionTypeEnum]
    )
    order = models.PositiveSmallIntegerField()
    is_required = models.BooleanField(default=False)
    is_ai_assisted = models.BooleanField(default=False)
    has_discussion = models.BooleanField(default=False)

    questionnaire_section = models.ForeignKey(
        "self",
        related_name="results_section",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    survey = models.ForeignKey(
        Survey, related_name="sections", on_delete=models.CASCADE
    )
    chats = GenericRelation(Chat, related_query_name="sections")

    questions: Manager["Question"]
    results: Manager["Result"]
