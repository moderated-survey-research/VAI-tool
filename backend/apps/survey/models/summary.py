from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from .submission import Submission
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Summary(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_summaries"

    content = models.TextField(null=True, blank=True)

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")

    submission = models.OneToOneField(
        Submission, related_name="summary", on_delete=models.CASCADE
    )
