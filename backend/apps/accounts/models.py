"""
User, Address, BusinessProfile.

`User` uses email as the auth identifier. `Address` is keyed by user FK so a
user can have multiple addresses (one is_default). `BusinessProfile` is an
optional 1:1 set during onboarding when the user picks "business".
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.core.models import TimeStampedModel

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    class AccountType(models.TextChoices):
        INDIVIDUAL = "individual", "Individual"
        BUSINESS = "business", "Business"

    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    account_type = models.CharField(
        max_length=20,
        choices=AccountType.choices,
        default=AccountType.INDIVIDUAL,
    )
    is_onboarded = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.email


class Address(TimeStampedModel):
    user = models.ForeignKey(
        User, related_name="addresses", on_delete=models.CASCADE,
    )
    line1 = models.CharField(max_length=200)
    line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=12)
    country = models.CharField(max_length=2, default="IN")
    is_default = models.BooleanField(default=False)

    class Meta:
        ordering = ("-is_default", "-created_at")

    def __str__(self) -> str:
        return f"{self.line1}, {self.city} ({self.user.email})"


class BusinessProfile(TimeStampedModel):
    user = models.OneToOneField(
        User, related_name="business", on_delete=models.CASCADE,
    )
    business_name = models.CharField(max_length=200)
    gstin = models.CharField(max_length=15, blank=True)

    def __str__(self) -> str:
        return self.business_name
