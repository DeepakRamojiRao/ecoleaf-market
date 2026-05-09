"""
Root URL configuration.

Layout:
    /admin/                         Django admin
    /api/v1/                        Versioned REST API (apps register here)
    /api/schema/                    OpenAPI schema (JSON)
    /api/schema/swagger/            Swagger UI
    /api/schema/redoc/              Redoc UI
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

api_v1_patterns = [
    path("", include("apps.core.urls")),
    # Future: path("auth/", include("apps.accounts.urls")), etc.
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include((api_v1_patterns, "v1"))),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger/", SpectacularSwaggerView.as_view(url_name="schema")),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
