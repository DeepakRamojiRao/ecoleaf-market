from rest_framework import serializers

from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Supplier
        fields = (
            "id",
            "name",
            "contact_email",
            "contact_phone",
            "address",
            "is_active",
            "notes",
            "product_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
