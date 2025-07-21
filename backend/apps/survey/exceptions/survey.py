from rest_framework.exceptions import APIException
from rest_framework import status
import apps.survey.constants.errorcodes as ERROR_CODES


class DuplicateSurveySubmissionException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "You have already submitted this survey."
    default_code = ERROR_CODES.SURVEY_DUPLICATE_SUBMISSION
