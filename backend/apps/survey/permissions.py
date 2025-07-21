from rest_framework.permissions import BasePermission
from rest_framework.views import APIView
from django.utils.translation import gettext as _
from apps.survey.request import SubmissionAPIRequest


class IsSubmissionAuthenticated(BasePermission):
    def has_permission(self, request: SubmissionAPIRequest, view: APIView):
        survey_id = view.kwargs.get("survey_id")
        if survey_id is None:
            return bool(request.submission)

        try:
            parsed_survey_id = int(survey_id)
        except ValueError:
            parsed_survey_id = None

        return bool(
            request.submission
            and (
                request.submission.survey.id == parsed_survey_id
                or request.submission.survey.key == survey_id
            )
        )
