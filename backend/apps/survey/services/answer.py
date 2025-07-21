from typing import Self, Any
from apps.survey.models import Question, Answer, Submission
from apps.survey.serializers.requests import AnswerRequestSerializer
from rest_framework.exceptions import ValidationError
from django.utils.translation import gettext as _


class AnswerService:
    _instance = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(AnswerService, cls).__new__(cls)
        return cls._instance

    def create(
        self,
        request_serializer: AnswerRequestSerializer,
        submission: Submission,
        question: Question,
    ) -> Answer:
        if question.answers.filter(submission=submission).exists():
            raise ValidationError(_("Answer for this question already exists."))
        return request_serializer.save(submission=submission, question=question)
