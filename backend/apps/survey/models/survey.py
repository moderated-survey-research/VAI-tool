from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from django.db.models import Manager
from typing import TYPE_CHECKING
from apps.survey.enums import SurveyTypeEnum, SurveyQuestionnaireTypeEnum

if TYPE_CHECKING:
    from .section import Section
    from .submission import Submission


class Survey(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "surveys"

    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField(max_length=500)
    email_template_uuid = models.UUIDField()
    type = models.CharField(
        max_length=50,
        choices=[(enum.value, enum.name) for enum in SurveyTypeEnum],
    )
    questionnaire_type = models.CharField(
        max_length=50,
        choices=[(enum.value, enum.name) for enum in SurveyQuestionnaireTypeEnum],
    )

    sections: Manager["Section"]
    submissions: Manager["Submission"]
