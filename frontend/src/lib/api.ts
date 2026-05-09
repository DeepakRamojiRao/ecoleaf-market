/**
 * Axios instance with JWT interceptors.
 *
 * Request: attaches `Authorization: Bearer <access>` from the auth store.
 * Response: on a single 401, transparently refreshes once and retries the
 * original request. If refresh also fails, the store is cleared and the user
 * is bounced to /login.
 *
 * Tokens live in localStorage (via zustand/persist). Tradeoff: simpler than
 * httpOnly cookies but susceptible to XSS — we mitigate with short-lived
 * access tokens (15min) + refresh rotation + blacklist-on-rotate.
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/store/authStore";

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api/v1";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const access = useAuthStore.getState().accessToken;
  if (access && config.headers) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// De-dupe parallel refreshes — many 401s in flight at once must not trigger
// many refresh calls. The first 401 starts a refresh, the rest await it.
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refresh = useAuthStore.getState().refreshToken;
  if (!refresh) return null;
  try {
    const { data } = await axios.post<{ access: string; refresh?: string }>(
      `${baseURL}/auth/refresh/`,
      { refresh },
    );
    useAuthStore.getState().setTokens(data.access, data.refresh ?? refresh);
    return data.access;
  } catch {
    useAuthStore.getState().clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    // Don't try to refresh against the auth endpoints themselves.
    if (original.url?.includes("/auth/login") || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshPromise ??= refreshTokens();
    const newAccess = await refreshPromise;
    refreshPromise = null;
    if (!newAccess) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${newAccess}`;
    return api(original);
  },
);
