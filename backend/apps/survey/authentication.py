from django.utils.translation import gettext_lazy as _
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from apps.survey.models import Submission
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, AuthenticationFailed
from apps.survey.request import SubmissionAPIRequest
from apps.survey.enums import SubmissionStatusEnum
from django.db.models import Q


class SubmissionTokenAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request: SubmissionAPIRequest):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None
        if len(auth) == 1:
            msg = _("Invalid token header. No credentials provided.")
            raise AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _("Invalid token header. Token string should not contain spaces.")
            raise AuthenticationFailed(msg)
        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = _(
                "Invalid token header. Token string should not contain invalid characters."
            )
            raise AuthenticationFailed(msg)
        return self.authenticate_credentials(token)

    def authenticate_credentials(self, key: str):
        try:
            submission = (
                Submission.objects.prefetch_related("survey")
                .exclude(
                    Q(status=SubmissionStatusEnum.COMPLETED.value)
                    | Q(status=SubmissionStatusEnum.EXITED.value)
                    | Q(status=SubmissionStatusEnum.TERMINATED.value)
                )
                .get(token=key)
            )
        except Submission.DoesNotExist:
            raise AuthenticationFailed(_("Invalid token."))
        # if (
        #     submission.expires_at
        #     and submission.expires_at < timezone.now() + timezone.timedelta(minutes=5)
        # ):
        #     raise AuthenticationFailed(_("The survey is no longer accessible."))

        return (submission, None)

    def authenticate_header(self, request: SubmissionAPIRequest):
        return self.keyword
