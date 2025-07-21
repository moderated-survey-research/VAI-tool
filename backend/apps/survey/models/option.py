from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from .question import Question
from django.db.models import Manager
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .choice import Choice


class Option(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_options"
        constraints = [
            models.UniqueConstraint(
                fields=["content", "question_id"],
                name="survey_options_content_question_id_unique",
            ),
            models.UniqueConstraint(
                fields=["order", "question_id"],
                name="survey_options_order_question_id_unique",
            ),
        ]
        ordering = ["order"]

    content = models.CharField(max_length=50)
    order = models.PositiveSmallIntegerField()
    requires_input = models.BooleanField(default=False)

    question = models.ForeignKey(
        Question, related_name="options", on_delete=models.CASCADE
    )

    choices: Manager["Choice"]
