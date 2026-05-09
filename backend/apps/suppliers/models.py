from django.db import models

from apps.core.models import TimeStampedModel


class Supplier(TimeStampedModel):
    name = models.CharField(max_length=200, unique=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name
