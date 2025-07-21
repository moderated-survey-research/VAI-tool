from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from django.db.models import Manager
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .question import Question


class Scale(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_scales"

    key = models.CharField(max_length=50, unique=True)
    options = models.JSONField()

    questions: Manager["Question"]

    @property
    def min_value(self) -> int:
        return min(map(int, self.options.keys()))

    @property
    def max_value(self) -> int:
        return max(map(int, self.options.keys()))
