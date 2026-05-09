/**
 * Admin shell — fixed sidebar (collapsible) + top bar + scrollable content.
 *
 * Renders an <Outlet /> for the matched admin route. Used by every page
 * under /admin/*. Routing already gates these behind requireStaff so we
 * can assume `user` is staff here.
 */
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutGrid,
  Leaf,
  LogOut,
  Menu,
  Package,
  Receipt,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { to: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
};

const NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/suppliers", label: "Suppliers", icon: Truck },
  { to: "/admin/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
  { to: "/admin/sales-orders", label: "Sales Orders", icon: ShoppingCart },
  { to: "/admin/retail-sales", label: "Retail Sales", icon: Store },
  { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
  {
    to: "/admin/categories",
    label: "Category",
    icon: ShoppingBag,
    children: [
      { to: "/admin/categories", label: "Manage Category", icon: LayoutGrid },
      { to: "/admin/categories/new", label: "Add Category" },
    ],
  },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/invoices", label: "Invoices", icon: Receipt },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white shadow-xl shadow-emerald-900/5 transition-transform lg:relative lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-stone-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-700/30">
            <Leaf className="h-5 w-5" aria-hidden />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-stone-900">
              BananaLeaf
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <SidebarItem key={item.to} item={item} />
          ))}
        </nav>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-stone-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-stone-100 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-stone-600 transition hover:bg-stone-100 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>

          {/* Search */}
          <div className="relative hidden flex-1 max-w-xl md:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search across the admin…"
              className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-lg p-2 text-stone-600 transition hover:bg-stone-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>

            <div className="hidden items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-1.5 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-semibold text-white">
                {user?.email.slice(0, 1).toUpperCase() ?? "A"}
              </div>
              <div className="leading-tight">
                <p className="max-w-[160px] truncate text-sm font-medium text-stone-900">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">
                  Admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout.mutate(undefined, {
                  onSettled: () => navigate("/login", { replace: true }),
                });
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const hasChildren = !!item.children?.length;

  // A parent is "open" when the current pathname is under its prefix,
  // OR when the user manually expanded it.
  const isUnderPrefix = location.pathname.startsWith(item.to);
  const [open, setOpen] = useState(isUnderPrefix);

  useEffect(() => {
    if (isUnderPrefix) setOpen(true);
  }, [isUnderPrefix]);

  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        end
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive
              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-700/30"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          }`
        }
      >
        <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isUnderPrefix
            ? "bg-emerald-50 text-emerald-700"
            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
        }`}
      >
        <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {open ? (
          <ChevronDown className="h-4 w-4" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden />
        )}
      </button>
      {open && (
        <div className="mt-1 space-y-1 pl-4">
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 font-semibold text-white shadow-md shadow-emerald-700/30"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`
              }
            >
              {child.icon ? (
                <child.icon className="h-4 w-4" aria-hidden />
              ) : (
                <FileText className="h-4 w-4" aria-hidden />
              )}
              <span className="truncate">{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
