/**
 * Route guard.
 *   - No tokens / no user      -> /login (preserves intended destination)
 *   - requireOnboarded=true and user not yet onboarded -> /onboarding
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

type Props = { requireOnboarded?: boolean };

export function ProtectedRoute({ requireOnboarded = false }: Props) {
  const user = useAuthStore((s) => s.user);
  const access = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!user || !access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requireOnboarded && !user.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
