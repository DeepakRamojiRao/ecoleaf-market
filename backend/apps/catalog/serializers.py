from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    children_count = serializers.IntegerField(read_only=True)
    product_count = serializers.IntegerField(read_only=True)
    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "parent",
            "parent_name",
            "image_url",
            "display_order",
            "is_active",
            "children_count",
            "product_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("slug", "created_at", "updated_at")


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "category",
            "category_name",
            "supplier",
            "supplier_name",
            "description",
            "price",
            "cost",
            "stock_quantity",
            "low_stock_threshold",
            "image_url",
            "is_active",
            "is_low_stock",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
