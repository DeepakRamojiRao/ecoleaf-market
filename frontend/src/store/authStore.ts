/**
 * Auth state container — user + tokens. Persisted to localStorage so a page
 * refresh keeps the session alive. Selectors keep React re-renders narrow.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AccountType = "individual" | "business";

export type User = {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  account_type: AccountType;
  is_onboarded: boolean;
  is_staff: boolean;
  created_at: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (user: User, access: string, refresh: string) => void;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      clear: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "ecomart-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
