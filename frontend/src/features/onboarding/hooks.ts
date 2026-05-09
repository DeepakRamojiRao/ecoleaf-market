import { useMutation } from "@tanstack/react-query";

import { authApi, type OnboardingPayload } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export function useOnboarding() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: OnboardingPayload) => authApi.onboarding(payload),
    onSuccess: (user) => setUser(user),
  });
}
