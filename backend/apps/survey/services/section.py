from typing import Self, Any
from django.shortcuts import get_object_or_404
from apps.survey.config import (
    BFI2S_EVALUATION_CONFIG,
    CFQ_EVALUATION_CONFIG,
    BFI2S_QUESTIONNAIRES,
    CFQ_QUESTIONNAIRES,
)
from typing import Self, Any
from apps.survey.models import Section, Submission, Result, Chat
from django.db.models import Prefetch
from apps.survey.enums import ChatType


class SectionService:
    _instance = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(SectionService, cls).__new__(cls)
        return cls._instance

    def get(
        self: Self,
        id: int,
        submission: Submission | None = None,
        get_or_404: bool = False,
    ) -> Section:
        query = Section.objects
        filter_criteria = {"id": id}
        if submission:
            filter_criteria["survey"] = submission.survey.id
            query = query.prefetch_related(
                "questions",
                Prefetch(
                    "results",
                    queryset=Result.objects.filter(submission=submission),
                    to_attr="selected_results",
                ),
                Prefetch(
                    "questionnaire_section",
                    queryset=Section.objects.prefetch_related(
                        Prefetch(
                            "results",
                            queryset=Result.objects.filter(submission=submission),
                            to_attr="selected_results",
                        )
                    ),
                ),
                Prefetch(
                    "chats",
                    queryset=Chat.objects.filter(
                        submission=submission, type=ChatType.DISCUSSION.value
                    ).prefetch_related("messages"),
                    to_attr="discussion_chats",
                ),
            )

        return (
            get_object_or_404(query, **filter_criteria)
            if get_or_404
            else query.get(**filter_criteria)
        )

    def get_upcoming_section(self: Self, submission: Submission) -> Section | None:
        return (
            submission.survey.sections.exclude(results__submission=submission)
            .order_by("order")
            .first()
        )

    def get_previous_section(self: Self, submission: Submission) -> Section | None:
        return (
            submission.survey.sections.filter(results__submission=submission)
            .order_by("order")
            .last()
        )

    def evaluate(self: Self, section: Section, submission: Submission) -> dict | None:
        if section.key in BFI2S_QUESTIONNAIRES:
            return self._evaluate_bfi2s(section, submission)
        elif section.key in CFQ_QUESTIONNAIRES:
            return self._evaluate_cfq(section, submission)
        else:
            return None

    def _evaluate_bfi2s(self: Self, section: Section, submission: Submission) -> dict:
        scores = {
            "domains": {
                domain: {
                    "score": 0.0,
                    "facets": {
                        facet: 0.0 for facet in domain_config["facets"]["scoring"]
                    },
                }
                for domain, domain_config in BFI2S_EVALUATION_CONFIG.items()
            }
        }

        max_scores = {
            "domains": {
                domain: len(domain_config["scoring"]) * 5
                for domain, domain_config in BFI2S_EVALUATION_CONFIG.items()
            },
            "facets": {
                facet: len(facet_questions) * 5
                for domain_config in BFI2S_EVALUATION_CONFIG.values()
                for facet, facet_questions in domain_config["facets"]["scoring"].items()
            },
        }

        all_answers = (
            submission.answers.filter(question__section=section)
            .select_related("question")
            .order_by("question__order")
        )
        answers_dict = {}
        attention_check_count = 0
        for answer in all_answers:
            if answer.question.is_attention_check:
                attention_check_count += 1
            else:
                answers_dict[answer.question.order - attention_check_count] = answer

        for domain, domain_config in BFI2S_EVALUATION_CONFIG.items():
            domain_score = 0

            for question_order, is_reversed in domain_config["scoring"].items():
                score = answers_dict[question_order].content
                if is_reversed:
                    score = 6 - score
                domain_score += score

            scores["domains"][domain]["score"] = round(
                (domain_score / max_scores["domains"][domain]) * 100, 2
            )

            for facet, facet_questions in domain_config["facets"]["scoring"].items():
                facet_score = 0
                for question_order, is_reversed in facet_questions.items():
                    score = answers_dict[question_order].content
                    if is_reversed:
                        score = 6 - score
                    facet_score += score

                scores["domains"][domain]["facets"][facet] = round(
                    (facet_score / max_scores["facets"][facet]) * 100, 2
                )

        return scores

    def _evaluate_cfq(self: Self, section: Section, submission: Submission) -> dict:
        total_score = 0
        scores = {
            domain: {
                "score": 0.0,
            }
            for domain in CFQ_EVALUATION_CONFIG.keys()
        }

        all_answers = (
            submission.answers.filter(question__section=section)
            .select_related("question")
            .order_by("question__order")
        )
        answers_dict = {}
        attention_check_count = 0
        for answer in all_answers:
            if answer.question.is_attention_check:
                attention_check_count += 1
            else:
                answers_dict[answer.question.order - attention_check_count] = answer

        for domain, questions in CFQ_EVALUATION_CONFIG.items():
            domain_score = sum(
                int(str(answers_dict[question_order].content))
                for question_order in questions
                if question_order in answers_dict
            )
            scores[domain]["score"] = round(domain_score, 2)
            total_score += domain_score

        return {"total": round(total_score, 2), "domains": scores}
