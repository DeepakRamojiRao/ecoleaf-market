"""
Abstract base models reused across the project.

`TimeStampedModel` adds created_at/updated_at to any model that inherits it —
auditing for free without writing the same fields in every app.
"""
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ("-created_at",)
