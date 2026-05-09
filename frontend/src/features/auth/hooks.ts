/**
 * React Query hooks wrapping the auth API. Mutations sync the auth store on
 * success so the rest of the app reads from a single source of truth.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) =>
      setSession(data.user, data.tokens.access, data.tokens.refresh),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password),
    onSuccess: (data) =>
      setSession(data.user, data.tokens.access, data.tokens.refresh),
  });
}

export function useLogout() {
  const refresh = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);
  const qc = useQueryClient();
  return useMutation({
    // If refresh is missing for any reason, treat logout as a local clear.
    mutationFn: () => (refresh ? authApi.logout(refresh) : Promise.resolve()),
    onSettled: () => {
      clear();
      qc.clear();
    },
  });
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled,
    staleTime: 5 * 60_000,
  });
}
