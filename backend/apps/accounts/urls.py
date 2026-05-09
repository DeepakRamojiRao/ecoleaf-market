from django.urls import path

from .views import (
    AdminCustomersView,
    LoginView,
    LogoutView,
    MeView,
    OnboardingView,
    RefreshView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("onboarding/", OnboardingView.as_view(), name="onboarding"),
    path("admin/customers/", AdminCustomersView.as_view(), name="admin-customers"),
]
