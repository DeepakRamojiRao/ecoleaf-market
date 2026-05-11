"""
Catalog models — Category and Product.

A Category can have a parent (self-FK) so the catalog tree can nest
arbitrarily. Products belong to a single category and an optional supplier.
Stock + threshold live on Product so the inventory page can compute
low-stock state with a single query.
"""
from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class Category(TimeStampedModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        related_name="children",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    image_url = models.URLField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("display_order", "name")
        constraints = [
            models.UniqueConstraint(fields=("name",), name="unique_category_name"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "category"
            slug = base
            counter = 1
            # Ensure uniqueness without a save loop in the typical case.
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                counter += 1
                slug = f"{base}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Product(TimeStampedModel):
    sku = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category, related_name="products", on_delete=models.PROTECT,
    )
    supplier = models.ForeignKey(
        "suppliers.Supplier",
        related_name="products",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    # Uploaded file (preferred). Saved under MEDIA_ROOT/products/<YYYY>/<MM>/.
    image = models.ImageField(
        upload_to="products/%Y/%m/", blank=True, null=True,
    )
    # Legacy / fallback. Used when there's no uploaded file (e.g. seed data
    # that references an external CDN). The frontend reads `image_display_url`
    # which resolves to whichever is set.
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("category", "is_active")),
        ]

    @property
    def is_low_stock(self) -> bool:
        return self.stock_quantity <= self.low_stock_threshold

    def __str__(self) -> str:
        return f"{self.sku} — {self.name}"
