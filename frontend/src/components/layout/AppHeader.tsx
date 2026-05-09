import { Leaf, LogOut, ShoppingCart } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";

/**
 * Top navigation. Matches the EcoShop header in the Figma:
 *   Leaf logo + wordmark | Home Products [Dashboard]    user-pill cart logout
 *
 *  - Dashboard link only renders for staff users.
 *  - Cart icon will gain an item-count badge in Phase B.
 *  - Logged-out users see Login / Sign up instead of the user/cart cluster.
 */
export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true }),
    });
  };

  return (
    <header className="border-b border-stone-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
            <Leaf className="h-4 w-4 text-brand-600" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">
            EcoShop
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-8 sm:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/products">Products</NavItem>
          {user?.is_staff && (
            <NavItem to="/dashboard">
              <span className="inline-flex items-center gap-1.5">
                <DashboardGlyph />
                Dashboard
              </span>
            </NavItem>
          )}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700">
                {user.email.split("@")[0]}
                {user.is_staff && (
                  <span className="rounded bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                    Admin
                  </span>
                )}
              </span>
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative rounded-md p-2 text-stone-700 hover:bg-stone-100"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                {/* Cart badge will be wired up in Phase B. */}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="rounded-md p-2 text-stone-700 hover:bg-stone-100"
              >
                <LogOut className="h-5 w-5" aria-hidden />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `text-sm font-medium transition ${
          isActive ? "text-brand-600" : "text-stone-700 hover:text-stone-900"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

// 4-dot grid glyph used by the Dashboard nav link in the Figma.
function DashboardGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}
