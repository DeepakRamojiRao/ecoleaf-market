from django.contrib import admin

from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "contact_email", "contact_phone", "is_active")
    search_fields = ("name", "contact_email")
    list_filter = ("is_active",)
