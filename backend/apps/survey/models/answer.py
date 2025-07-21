from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from .question import Question
from .submission import Submission
from django.db.models import Manager
from typing import TYPE_CHECKING
from apps.survey.enums import QuestionTypeEnum

if TYPE_CHECKING:
    from .choice import Choice


class Answer(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_answers"
        constraints = [
            models.UniqueConstraint(
                fields=["question_id", "submission_id"],
                name="survey_answers_question_id_submission_id_unique",
            )
        ]

    _content = models.TextField(
        db_column="content", max_length=500, null=True, blank=True
    )
    explanation = models.TextField(max_length=500, null=True, blank=True)

    question = models.ForeignKey(
        Question, related_name="answers", on_delete=models.RESTRICT
    )
    submission = models.ForeignKey(
        Submission, related_name="answers", on_delete=models.CASCADE
    )

    choices: Manager["Choice"]

    @property
    def content(self) -> str | None:
        if self._content is None:
            return None
        match self.question.type:
            case QuestionTypeEnum.NUMERIC.value | QuestionTypeEnum.SCALE.value:
                return int(self._content)
            case QuestionTypeEnum.BOOLEAN.value:
                return bool(self._content)
        return self._content

    @content.setter
    def content(self, value: str | None) -> None:
        self._content = value
