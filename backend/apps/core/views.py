"""Liveness + readiness endpoints used by Docker healthchecks and load balancers."""
from django.db import connection
from django.core.cache import cache
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Cheap liveness probe — does not touch downstream services."""

    permission_classes = (AllowAny,)
    authentication_classes = ()

    def get(self, request):
        return Response({"status": "ok"})


class ReadinessView(APIView):
    """Verifies DB and cache are reachable. Used by orchestrators before routing traffic."""

    permission_classes = (AllowAny,)
    authentication_classes = ()

    def get(self, request):
        checks = {"database": "ok", "cache": "ok"}
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:  # pragma: no cover  # noqa: BLE001
            checks["database"] = "error"
        try:
            cache.set("readiness", "1", timeout=5)
            cache.get("readiness")
        except Exception:  # pragma: no cover  # noqa: BLE001
            checks["cache"] = "error"
        status_code = 200 if all(v == "ok" for v in checks.values()) else 503
        return Response(checks, status=status_code)
