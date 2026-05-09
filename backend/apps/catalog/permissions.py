"""
Permission classes shared across admin-facing viewsets.

Reads are open to authenticated users (a customer can browse the catalog).
Writes (POST/PATCH/PUT/DELETE) require `is_staff`.
"""
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)
