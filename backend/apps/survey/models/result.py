from django.db import models
from apps.common.models import TimeStamped
from django_stubs_ext.db.models import TypedModelMeta
from .section import Section
from .submission import Submission


class Result(TimeStamped):
    class Meta(TypedModelMeta):
        db_table = "survey_results"
        constraints = [
            models.UniqueConstraint(
                fields=["submission_id", "section_id"],
                name="survey_results_submission_id_section_id_unique",
            )
        ]

    data = models.JSONField(null=True, blank=True)

    submission = models.ForeignKey(
        Submission, related_name="results", on_delete=models.CASCADE
    )
    section = models.ForeignKey(
        Section, related_name="results", on_delete=models.RESTRICT
    )

    @property
    def completed_at(self) -> str:
        return self.created_at
