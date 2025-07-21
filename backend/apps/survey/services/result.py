from typing import Self, Any
from apps.survey.models import Submission, Section, Result
from apps.survey.enums import SectionTypeEnum
from apps.survey.services import SectionService
from rest_framework.exceptions import ValidationError
from django.utils.translation import gettext as _


class ResultService:
    _instance = None

    _section_service = SectionService()

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(ResultService, cls).__new__(cls)
        return cls._instance

    def create(
        self: Self, submission: Submission, section: Section, data: dict | None = None
    ) -> Result:
        if section.results.filter(submission=submission).exists():
            raise ValidationError(_("Result for this section already exists."))
        if (
            section.type != SectionTypeEnum.QUESTIONNAIRE.value
            or not section.is_required
        ):
            return Result.objects.create(submission=submission, section=section)
        required_questions = section.questions.filter(is_required=True)
        answers = submission.answers.filter(
            question__section=section, question__is_required=True
        )
        if answers.count() != required_questions.count():
            raise ValidationError(
                _("All required questions must be answered before proceeding.")
            )
        data = self._section_service.evaluate(section, submission)
        return Result.objects.create(submission=submission, section=section, data=data)
