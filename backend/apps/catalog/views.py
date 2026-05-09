"""
Catalog viewsets — Category and Product.

Both expose full CRUD. Lists support search (?search=term) and ordering
(?ordering=field,-other). Reads are authenticated; writes are admin-only.
"""
from django.db.models import Count, F
from rest_framework import filters, viewsets

from .models import Category, Product
from .permissions import IsAdminOrReadOnly
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "description", "slug")
    ordering_fields = ("display_order", "name", "created_at")
    ordering = ("display_order", "name")

    def get_queryset(self):
        qs = Category.objects.all().annotate(
            children_count=Count("children", distinct=True),
            product_count=Count("products", distinct=True),
        )
        parent = self.request.query_params.get("parent")
        if parent == "null":
            qs = qs.filter(parent__isnull=True)
        elif parent:
            qs = qs.filter(parent_id=parent)
        return qs


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (IsAdminOrReadOnly,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("sku", "name", "description")
    ordering_fields = (
        "name",
        "sku",
        "price",
        "stock_quantity",
        "created_at",
    )
    ordering = ("-created_at",)

    def get_queryset(self):
        qs = Product.objects.select_related("category", "supplier")
        category = self.request.query_params.get("category")
        supplier = self.request.query_params.get("supplier")
        low_stock = self.request.query_params.get("low_stock")
        if category:
            qs = qs.filter(category_id=category)
        if supplier:
            qs = qs.filter(supplier_id=supplier)
        if low_stock in {"1", "true", "yes"}:
            qs = qs.filter(stock_quantity__lte=F("low_stock_threshold"))
        return qs
