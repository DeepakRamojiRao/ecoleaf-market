from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Address, BusinessProfile, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = (
        "email",
        "full_name",
        "account_type",
        "is_onboarded",
        "is_staff",
        "is_active",
    )
    list_filter = ("account_type", "is_onboarded", "is_staff", "is_active")
    search_fields = ("email", "full_name", "phone")
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("full_name", "phone", "account_type", "is_onboarded")}),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
        }),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2"),
        }),
    )
    readonly_fields = ("last_login",)


admin.site.register(Address)
admin.site.register(BusinessProfile)
