from typing import Self, Any
from apps.survey.models import Survey
from django.shortcuts import get_object_or_404
from apps.survey.services import EmailService, SubmissionService
from apps.survey.utils import URLUtil
from django.conf import settings


class SurveyService:
    _instance = None

    _submission_service = SubmissionService()
    _email_service = EmailService()

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(SurveyService, cls).__new__(cls)
        return cls._instance

    def get(self: Self, id: int | str, get_or_404: bool = False) -> Survey:
        query = Survey.objects.prefetch_related(
            "sections__questions__options",
            "sections__questions",
        )
        filter_kwargs = {"id": id} if isinstance(id, int) else {"key": id}

        return (
            get_object_or_404(query, **filter_kwargs)
            if get_or_404
            else query.get(**filter_kwargs)
        )

    def all(self: Self) -> list[Survey]:
        return Survey.objects.all()

    def dispatch_emails(self: Self, survey: Survey, emails: list[str]) -> None:
        email_data = []
        for email in emails:
            survey_link = URLUtil.construct_url(
                settings.FRONTEND_HOST,
                f"/surveys/{survey.id}",
            )
            email_data.append(
                {
                    "to": email,
                    "template_uuid": str(survey.email_template_uuid),
                    "template_variables": {
                        "survey_link": survey_link,
                    },
                }
            )
        self._email_service.bulk_send_emails(email_data)
