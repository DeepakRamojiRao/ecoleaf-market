import { Leaf, LogOut, MapPin, Search, ShoppingCart, User as UserIcon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";

/**
 * Customer-facing storefront header.
 *
 *   row 1 (lg+) : brand · big search · deliver-to · account · cart
 *   row 2 (lg+) : Home · Products · Categories · Deals · Contact
 *
 * On mobile the search collapses below row 1 and only the brand + cart
 * + account stay in the bar.
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
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-700/30">
            <Leaf className="h-5 w-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight text-stone-900">
              BananaLeaf
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Market
            </span>
          </span>
        </Link>

        {/* Search — full-width on its own line on mobile */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement)?.value;
            navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
          }}
          className="order-3 w-full lg:order-none lg:flex-1 lg:px-4"
        >
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <input
              name="q"
              type="search"
              placeholder="Search banana leaves, sizes, suppliers…"
              className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </form>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              {/* Deliver-to chip — informational, hidden on small screens */}
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 md:inline-flex">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Deliver to me
              </span>

              {user.is_staff && (
                <NavLink
                  to="/admin/dashboard"
                  className="hidden rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-700 sm:inline-block"
                >
                  Admin Console
                </NavLink>
              )}

              <Link
                to="/cart"
                aria-label="Cart"
                className="relative rounded-full p-2 text-stone-700 transition hover:bg-stone-100"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                  0
                </span>
              </Link>

              <div className="relative inline-flex items-center gap-2 rounded-full bg-stone-100 px-2.5 py-1.5 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-semibold text-white">
                  {(user.full_name || user.email).slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate text-stone-700 md:block">
                  {user.email.split("@")[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="rounded-full p-2 text-stone-700 transition hover:bg-stone-100"
              >
                <LogOut className="h-5 w-5" aria-hidden />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                <UserIcon className="h-4 w-4" aria-hidden />
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Secondary nav — visible on lg+ */}
      <div className="hidden border-t border-stone-100 bg-white lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-7 px-6 py-2 text-sm">
          <NavItem to="/" end>
            Home
          </NavItem>
          <NavItem to="/products">All products</NavItem>
          <NavItem to="/products?category=fresh">Fresh leaves</NavItem>
          <NavItem to="/products?category=cut">Cut sizes</NavItem>
          <NavItem to="/products?deals=1">Deals</NavItem>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-stone-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Same-day cut · 48-hour delivery
          </span>
        </nav>
      </div>
    </header>
  );
}

function NavItem({
  to,
  children,
  end,
}: {
  to: string;
  children: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `text-sm font-medium transition ${
          isActive
            ? "text-emerald-700"
            : "text-stone-600 hover:text-stone-900"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
