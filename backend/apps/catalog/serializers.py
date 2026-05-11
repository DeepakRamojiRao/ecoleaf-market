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
    # `image_display_url` is the one the frontend should read: uploaded file
    # absolute URL when present, else falls back to the legacy image_url.
    image_display_url = serializers.SerializerMethodField()

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
            "image",            # writable file upload (multipart/form-data)
            "image_url",        # legacy URL field, still writable for backfill
            "image_display_url",
            "is_active",
            "is_low_stock",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at", "image_display_url")
        extra_kwargs = {
            # Both upload + URL are optional; product can have either, both, or
            # neither. Frontend resolves which to show via image_display_url.
            "image": {"required": False, "allow_null": True},
            "image_url": {"required": False, "allow_blank": True},
        }

    def get_image_display_url(self, obj: Product) -> str:
        """Absolute URL of the uploaded file if present, else the legacy URL."""
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.image_url or ""
