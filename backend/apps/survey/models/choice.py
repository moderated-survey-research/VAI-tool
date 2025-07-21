from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from .option import Option
from .answer import Answer


class Choice(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_choices"
        constraints = [
            models.UniqueConstraint(
                fields=["option_id", "answer_id"],
                name="survey_choices_option_id_answer_id_unique",
            )
        ]

    content = models.TextField(max_length=500, null=True, blank=True)

    option = models.ForeignKey(
        Option, related_name="choices", on_delete=models.RESTRICT
    )
    answer = models.ForeignKey(Answer, related_name="choices", on_delete=models.CASCADE)
