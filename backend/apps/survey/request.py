from rest_framework.request import Request, wrap_attributeerrors
from rest_framework import exceptions
from apps.survey.models import Submission


class SubmissionAPIRequest(Request):
    @property
    def submission(self) -> Submission | None:
        if not hasattr(self, "_submission"):
            with wrap_attributeerrors():
                self._authenticate()
        return self._submission

    @submission.setter
    def submission(self, value: Submission | None) -> None:
        self._submission = value
        self._request.submission = value

    def _authenticate(self) -> None:
        for authenticator in self.authenticators:
            try:
                submission_auth_tuple = authenticator.authenticate(self)
            except exceptions.APIException:
                self._not_authenticated()
                raise

            if submission_auth_tuple is not None:
                self._authenticator = authenticator
                self.submission, self.auth = submission_auth_tuple
                return

        self._not_authenticated()

    def _not_authenticated(self) -> None:
        self._authenticator = None
        self.submission = None
        self.auth = None
