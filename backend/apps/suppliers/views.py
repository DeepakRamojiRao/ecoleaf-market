from django.db.models import Count
from rest_framework import filters, viewsets

from apps.catalog.permissions import IsAdminOrReadOnly

from .models import Supplier
from .serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = (IsAdminOrReadOnly,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "contact_email", "contact_phone", "address")
    ordering_fields = ("name", "created_at")
    ordering = ("name",)

    def get_queryset(self):
        return Supplier.objects.annotate(
            product_count=Count("products", distinct=True),
        )
