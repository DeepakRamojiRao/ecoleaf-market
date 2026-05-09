/**
 * Typed wrappers around the /api/v1/auth/* endpoints. Return types match the
 * backend serializers — no frontend reshaping.
 */
import { api } from "@/lib/api";
import type { AccountType, User } from "@/store/authStore";

export type AuthResponse = {
  user: User;
  tokens: { access: string; refresh: string };
};

export type OnboardingPayload = {
  full_name: string;
  phone: string;
  account_type: AccountType;
  business?: { business_name: string; gstin?: string } | null;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
};

export const authApi = {
  register: (email: string, password: string) =>
    api
      .post<AuthResponse>("/auth/register/", { email, password })
      .then((r) => r.data),

  login: (email: string, password: string) =>
    api
      .post<AuthResponse>("/auth/login/", { email, password })
      .then((r) => r.data),

  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }).then((r) => r.data),

  me: () => api.get<User>("/auth/me/").then((r) => r.data),

  onboarding: (payload: OnboardingPayload) =>
    api.post<User>("/auth/onboarding/", payload).then((r) => r.data),
};
