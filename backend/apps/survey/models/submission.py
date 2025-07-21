import secrets
import base64
from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from .survey import Survey
from apps.survey.enums import SubmissionStatusEnum
from django.db.models import Manager
from typing import TYPE_CHECKING
from datetime import timedelta
from django.conf import settings
from django.utils import timezone

if TYPE_CHECKING:
    from .answer import Answer
    from .result import Result
    from .summary import Summary
    from .chat import Chat


class Submission(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_submissions"

    status = models.CharField(
        max_length=50,
        choices=[(enum.value, enum.name) for enum in SubmissionStatusEnum],
        default=SubmissionStatusEnum.INITIATED.value,
    )
    guid = models.CharField(max_length=255, null=True, blank=True)
    token = models.CharField(max_length=64, unique=True, editable=False)
    fingerprint = models.CharField(max_length=255, null=True, blank=True)
    violation_count = models.PositiveSmallIntegerField(default=0)
    avatar_id = models.CharField(max_length=50, null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    privacy_consent_given_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    survey = models.ForeignKey(
        Survey, related_name="submissions", on_delete=models.RESTRICT
    )

    chats: Manager["Chat"]
    answers: Manager["Answer"]
    results: Manager["Result"]
    summary: "Summary"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode(
                "utf-8"
            )
        # if self.privacy_consent_given_at and not self.expires_at:
        #     self.expires_at = timezone.now() + timedelta(hours=settings.SURVEY_TTL)
        if (
            self.status is SubmissionStatusEnum.IN_PROGRESS.value
            and not self.started_at
        ):
            self.started_at = timezone.now()
        if (
            self.status is SubmissionStatusEnum.COMPLETED.value
            and not self.completed_at
        ):
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)
