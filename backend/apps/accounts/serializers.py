"""
Serializers for auth + onboarding. The `UserSerializer` is the canonical
read shape returned from /me, /login, /register, /onboarding — frontend
consumes one type everywhere.
"""
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, BusinessProfile, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "phone",
            "account_type",
            "is_onboarded",
            "is_staff",
            "created_at",
        )
        # is_staff is read-only — flipping it is a server-side admin action only.
        read_only_fields = ("id", "is_onboarded", "is_staff", "created_at")


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "line1",
            "line2",
            "city",
            "state",
            "pincode",
            "country",
            "is_default",
        )
        read_only_fields = ("id", "is_default")


class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = ("business_name", "gstin")


class RegisterSerializer(serializers.ModelSerializer):
    """Email + password only. Profile fields are collected in onboarding."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ("email", "password")

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(**validated_data)


class OnboardingSerializer(serializers.Serializer):
    """
    Single-shot onboarding payload — all three steps land in one request.
    Atomic save: if any sub-write fails, the whole operation rolls back so
    we don't end up with `is_onboarded=True` but no address.
    """

    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    account_type = serializers.ChoiceField(choices=User.AccountType.choices)
    business = BusinessProfileSerializer(required=False, allow_null=True)
    address = AddressSerializer()

    def validate(self, attrs: dict) -> dict:
        if attrs["account_type"] == User.AccountType.BUSINESS and not attrs.get("business"):
            raise serializers.ValidationError(
                {"business": "Business name is required for business accounts."}
            )
        return attrs

    @transaction.atomic
    def save(self, **kwargs) -> User:
        user: User = self.context["request"].user
        data = self.validated_data

        user.full_name = data["full_name"]
        user.phone = data["phone"]
        user.account_type = data["account_type"]
        user.is_onboarded = True
        user.save(
            update_fields=[
                "full_name", "phone", "account_type",
                "is_onboarded", "updated_at",
            ]
        )

        # Default address — replace any prior default rather than stack rows.
        Address.objects.filter(user=user, is_default=True).delete()
        Address.objects.create(user=user, is_default=True, **data["address"])

        if data["account_type"] == User.AccountType.BUSINESS and data.get("business"):
            BusinessProfile.objects.update_or_create(
                user=user, defaults=data["business"],
            )

        return user


def issue_tokens(user: User) -> dict[str, str]:
    """Mint a JWT access/refresh pair for a freshly registered user."""
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}
