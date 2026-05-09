/**
 * Route guard.
 *   - No tokens / no user                                -> /login (preserves intended destination)
 *   - requireOnboarded=true and user not yet onboarded   -> /onboarding
 *   - requireStaff=true   and user is not staff          -> / (storefront)
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";

type Props = { requireOnboarded?: boolean; requireStaff?: boolean };

export function ProtectedRoute({
  requireOnboarded = false,
  requireStaff = false,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const access = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!user || !access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requireStaff && !user.is_staff) {
    // Authenticated but not authorized — bounce to the storefront, do not
    // surface a "404"/"forbidden" page that could leak admin route presence.
    return <Navigate to="/" replace />;
  }
  if (requireOnboarded && !user.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}

/**
 * Inverse guard for /login and /signup — if the user is already
 * authenticated, send them on to their landing page instead of letting
 * them re-enter the auth flow.
 */
export function PublicOnlyRoute() {
  const user = useAuthStore((s) => s.user);
  const access = useAuthStore((s) => s.accessToken);

  if (user && access) {
    return <Navigate to={user.is_staff ? "/admin/dashboard" : "/"} replace />;
  }
  return <Outlet />;
}
