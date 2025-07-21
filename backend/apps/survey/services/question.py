from typing import Self, Any
from apps.survey.models import Question, Survey, Section, Submission
from django.shortcuts import get_object_or_404


class QuestionService:
    _instance = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(QuestionService, cls).__new__(cls)
        return cls._instance

    def get(
        self: Self, id: int, survey: Survey | None = None, get_or_404: bool = False
    ) -> Question:
        filter_criteria = {"id": id}
        if survey:
            filter_criteria["section__survey"] = survey.id

        return (
            get_object_or_404(Question, **filter_criteria)
            if get_or_404
            else Question.objects.get(**filter_criteria)
        )

    def get_upcoming_question(
        self: Self, section: Section, submission: Submission
    ) -> Question | None:
        return (
            section.questions.exclude(answers__submission=submission)
            .order_by("order")
            .first()
        )

    def get_previous_question(
        self: Self, section: Section, submission: Submission
    ) -> Question | None:
        return (
            section.questions.filter(answers__submission=submission)
            .order_by("order")
            .last()
        )
