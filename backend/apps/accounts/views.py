"""
Auth + onboarding endpoints.

  POST /api/v1/auth/register/    -> { user, tokens }
  POST /api/v1/auth/login/       -> { user, tokens }     (email + password)
  POST /api/v1/auth/refresh/     -> { access, refresh }
  POST /api/v1/auth/logout/      -> 204                  (blacklists refresh)
  GET  /api/v1/auth/me/          -> user
  PATCH /api/v1/auth/me/         -> user
  POST /api/v1/auth/onboarding/  -> user (with is_onboarded=True)
"""
from django.contrib.auth import get_user_model
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    OnboardingSerializer,
    RegisterSerializer,
    UserSerializer,
    issue_tokens,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user).data, "tokens": issue_tokens(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """Wraps simplejwt to return user + tokens together (saves a /me call)."""

    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            user = User.objects.get(email=request.data.get("email"))
            response.data = {
                "user": UserSerializer(user).data,
                "tokens": response.data,
            }
        return response


class RefreshView(TokenRefreshView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()


class LogoutView(APIView):
    """Blacklist the supplied refresh token. Access tokens expire on their own."""

    def post(self, request):
        try:
            RefreshToken(request.data["refresh"]).blacklist()
        except (KeyError, TokenError):
            return Response(
                {"detail": "Invalid or missing refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH the authenticated user's profile."""

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class OnboardingView(APIView):
    """Submit the full multi-step onboarding payload in one request."""

    def post(self, request):
        serializer = OnboardingSerializer(
            data=request.data, context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class AdminCustomersView(generics.ListAPIView):
    """Admin-only list of registered users (for the Customers page)."""

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("email", "full_name", "phone")
    ordering_fields = ("created_at", "email", "full_name")
    ordering = ("-created_at",)

    def get_queryset(self):
        # Customers are non-staff users. Admins manage themselves separately.
        return User.objects.filter(is_staff=False)
