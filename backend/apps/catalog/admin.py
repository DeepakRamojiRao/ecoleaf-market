from django.contrib import admin

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "parent", "display_order", "is_active")
    search_fields = ("name", "slug")
    list_filter = ("is_active", "parent")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "sku",
        "name",
        "category",
        "supplier",
        "price",
        "stock_quantity",
        "is_active",
    )
    search_fields = ("sku", "name")
    list_filter = ("is_active", "category", "supplier")
