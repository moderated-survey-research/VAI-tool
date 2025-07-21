from django.db import models
from django_stubs_ext.db.models import TypedModelMeta


class TimeStamped(models.Model):
    class Meta(TypedModelMeta):
        abstract = True

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
