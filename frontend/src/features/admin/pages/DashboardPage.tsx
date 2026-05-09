/**
 * Admin dashboard — operations overview for staff.
 *
 *  Section breakdown:
 *    1. Greeting hero
 *    2. KPI strip (4 stat cards)
 *    3. Two-column row: Inventory health + Quick actions
 *    4. Two-column row: Low-stock list + Top categories chart
 *    5. Two-column row: Recent products + Recent customers
 *
 *  All numbers come from the same endpoints the management pages use, so
 *  there's no duplicate "stats" API to maintain.
 */
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Boxes,
  ClipboardList,
  Flame,
  Package,
  PackageX,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/admin/PageHeader";
import { adminApi } from "@/api/admin";
import {
  categoriesApi,
  productsApi,
  type Category,
  type Product,
} from "@/api/catalog";
import { suppliersApi } from "@/api/suppliers";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  // Counts (cheap — page_size=1 returns count without payload)
  const categoriesCount = useQuery({
    queryKey: ["admin", "categories", "count"],
    queryFn: () => categoriesApi.list({ page_size: 1 }),
  });
  const productsCount = useQuery({
    queryKey: ["admin", "products", "count"],
    queryFn: () => productsApi.list({ page_size: 1 }),
  });
  const suppliersCount = useQuery({
    queryKey: ["admin", "suppliers", "count"],
    queryFn: () => suppliersApi.list({ page_size: 1 }),
  });
  const customersCount = useQuery({
    queryKey: ["admin", "customers", "count"],
    queryFn: () => adminApi.customers({ page_size: 1 }),
  });

  // Lists for the activity / inventory rails
  const lowStock = useQuery({
    queryKey: ["admin", "products", "low-stock"],
    queryFn: () => productsApi.list({ page_size: 5, low_stock: true }),
  });
  const recentProducts = useQuery({
    queryKey: ["admin", "products", "recent"],
    queryFn: () => productsApi.list({ ordering: "-created_at", page_size: 5 }),
  });
  const recentCustomers = useQuery({
    queryKey: ["admin", "customers", "recent"],
    queryFn: () => adminApi.customers({ ordering: "-created_at", page_size: 5 }),
  });
  const allCategoriesForChart = useQuery({
    queryKey: ["admin", "categories", "for-chart"],
    queryFn: () =>
      categoriesApi.list({ ordering: "display_order", page_size: 50 }),
  });
  const allProductsForHealth = useQuery({
    queryKey: ["admin", "products", "for-health"],
    queryFn: () => productsApi.list({ page_size: 200 }),
  });

  const health = useMemo(
    () => computeInventoryHealth(allProductsForHealth.data?.results ?? []),
    [allProductsForHealth.data],
  );

  const topCategories = useMemo(
    () => topByProductCount(allCategoriesForChart.data?.results ?? [], 6),
    [allCategoriesForChart.data],
  );

  return (
    <>
      {/* Greeting hero */}
      <div
        className="mb-6 overflow-hidden rounded-3xl text-white shadow-xl"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(190, 242, 100, 0.35) 0%, transparent 50%), linear-gradient(120deg, #14532d 0%, #166534 60%, #047857 100%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/25 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {greetingFor(new Date())}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {user?.full_name ? `Hi ${user.full_name.split(" ")[0]}.` : "Welcome back."}
            </h1>
            <p className="mt-1 text-sm text-emerald-50/90 sm:text-base">
              Here's what's happening across the BananaLeaf warehouse today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/categories/new"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              New category
            </Link>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              <Package className="h-4 w-4" aria-hidden />
              Manage products
            </Link>
          </div>
        </div>
      </div>

      <PageHeader
        title="At a glance"
        subtitle="Live counts, inventory health, and the latest activity."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Categories"
          icon={<ShoppingBag className="h-5 w-5" aria-hidden />}
          value={categoriesCount.data?.count}
          tone="emerald"
          to="/admin/categories"
          hint="Storefront tree"
        />
        <Kpi
          label="Products"
          icon={<Package className="h-5 w-5" aria-hidden />}
          value={productsCount.data?.count}
          tone="lime"
          to="/admin/products"
          hint="Active SKUs"
        />
        <Kpi
          label="Suppliers"
          icon={<Truck className="h-5 w-5" aria-hidden />}
          value={suppliersCount.data?.count}
          tone="amber"
          to="/admin/suppliers"
          hint="Sourcing partners"
        />
        <Kpi
          label="Customers"
          icon={<Users className="h-5 w-5" aria-hidden />}
          value={customersCount.data?.count}
          tone="sky"
          to="/admin/customers"
          hint="Registered buyers"
        />
      </div>

      {/* Inventory health + Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Boxes className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Inventory health
              </p>
              <p className="text-xs text-stone-500">
                Pulled from {allProductsForHealth.data?.results.length ?? 0} active products.
              </p>
            </div>
            <Link
              to="/admin/inventory"
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Open inventory <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HealthTile
              label="Total stock"
              value={health.totalUnits.toLocaleString()}
              hint="Units on hand"
              tone="emerald"
              icon={<Boxes className="h-4 w-4" aria-hidden />}
            />
            <HealthTile
              label="Healthy"
              value={String(health.healthy)}
              hint="Above threshold"
              tone="lime"
              icon={<BadgeCheck className="h-4 w-4" aria-hidden />}
            />
            <HealthTile
              label="Low stock"
              value={String(health.low)}
              hint="At or below threshold"
              tone="amber"
              icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
            />
            <HealthTile
              label="Out of stock"
              value={String(health.out)}
              hint="Need re-stocking"
              tone="rose"
              icon={<PackageX className="h-4 w-4" aria-hidden />}
            />
          </div>

          {/* Stock-level bar */}
          {(health.healthy + health.low + health.out) > 0 && (
            <div className="mt-5">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="bg-emerald-500"
                  style={{ width: `${pct(health.healthy, health.total)}%` }}
                />
                <div
                  className="bg-amber-500"
                  style={{ width: `${pct(health.low, health.total)}%` }}
                />
                <div
                  className="bg-rose-500"
                  style={{ width: `${pct(health.out, health.total)}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-stone-500">
                <Legend dot="bg-emerald-500" label={`Healthy ${pct(health.healthy, health.total)}%`} />
                <Legend dot="bg-amber-500" label={`Low ${pct(health.low, health.total)}%`} />
                <Legend dot="bg-rose-500" label={`Out ${pct(health.out, health.total)}%`} />
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div
          className="rounded-2xl p-5 text-white shadow-md"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(190, 242, 100, 0.3) 0%, transparent 60%), linear-gradient(135deg, #047857 0%, #065f46 100%)",
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-emerald-100">
            <TrendingUp className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-4 text-lg font-semibold tracking-tight">
            Quick actions
          </p>
          <p className="mt-1 text-sm text-emerald-100/80">
            Jump straight into common admin tasks.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <QuickLink
              to="/admin/categories/new"
              label="Add a new category"
              icon={<ShoppingBag className="h-4 w-4" />}
            />
            <QuickLink
              to="/admin/products"
              label="Manage products"
              icon={<Package className="h-4 w-4" />}
            />
            <QuickLink
              to="/admin/suppliers"
              label="Add a supplier"
              icon={<Truck className="h-4 w-4" />}
            />
            <QuickLink
              to="/admin/purchase-orders"
              label="Open purchase orders"
              icon={<ClipboardList className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Low-stock + top categories */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ListCard
          title="Low-stock products"
          subtitle="Re-order before you run out."
          icon={<AlertTriangle className="h-5 w-5" aria-hidden />}
          tone="amber"
          link={{ to: "/admin/inventory", label: "View inventory" }}
          loading={lowStock.isLoading}
          empty="All products are above their thresholds."
        >
          {lowStock.data?.results.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-900">{p.name}</p>
                <p className="truncate text-xs text-stone-500">
                  SKU {p.sku} · {p.category_name ?? "—"}
                </p>
              </div>
              <span className="ml-3 shrink-0 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {p.stock_quantity} on hand
              </span>
            </li>
          ))}
        </ListCard>

        {/* Top categories — text-bar chart so we don't pull a chart lib */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Flame className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Top categories by product count
              </p>
              <p className="text-xs text-stone-500">
                The catalog branches shopping the most.
              </p>
            </div>
          </div>
          <div className="mt-5">
            {allCategoriesForChart.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-3 w-full animate-pulse rounded bg-stone-100" />
                ))}
              </div>
            ) : topCategories.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">
                No categories yet — add one to start populating the chart.
              </p>
            ) : (
              <ul className="space-y-3">
                {topCategories.map((c) => {
                  const max = topCategories[0]?.product_count ?? 1;
                  const w = max === 0 ? 0 : ((c.product_count ?? 0) / max) * 100;
                  return (
                    <li key={c.id} className="text-sm">
                      <div className="flex justify-between">
                        <Link
                          to={`/admin/categories`}
                          className="truncate font-medium text-stone-800 hover:text-emerald-700"
                        >
                          {c.name}
                        </Link>
                        <span className="ml-3 text-xs font-semibold text-stone-600">
                          {c.product_count ?? 0}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700 transition-[width] duration-500"
                          style={{ width: `${w}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Recent products + recent customers */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListCard
          title="Recently added products"
          subtitle="Latest additions to the catalog."
          icon={<Package className="h-5 w-5" aria-hidden />}
          tone="emerald"
          link={{ to: "/admin/products", label: "Manage products" }}
          loading={recentProducts.isLoading}
          empty="No products yet — add your first one."
        >
          {recentProducts.data?.results.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div className="min-w-0 flex items-center gap-3">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-stone-200"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-[10px] text-stone-400">
                    img
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{p.name}</p>
                  <p className="truncate text-xs text-stone-500">
                    SKU {p.sku} · {p.category_name ?? "—"}
                  </p>
                </div>
              </div>
              <span className="ml-3 shrink-0 text-xs font-semibold text-stone-600">
                ₹{p.price}
              </span>
            </li>
          ))}
        </ListCard>

        <ListCard
          title="New customers"
          subtitle="Latest sign-ups to the storefront."
          icon={<UserPlus className="h-5 w-5" aria-hidden />}
          tone="sky"
          link={{ to: "/admin/customers", label: "View customers" }}
          loading={recentCustomers.isLoading}
          empty="No customers yet."
        >
          {recentCustomers.data?.results.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-xs font-semibold text-white">
                  {c.email.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">
                    {c.full_name || c.email}
                  </p>
                  <p className="truncate text-xs text-stone-500">{c.email}</p>
                </div>
              </div>
              <span className="ml-3 shrink-0 text-xs text-stone-500">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ListCard>
      </div>
    </>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */

type Tone = "emerald" | "lime" | "amber" | "sky" | "rose";

const TONES: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  lime: "bg-lime-50 text-lime-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  rose: "bg-rose-50 text-rose-700",
};

function Kpi({
  label,
  icon,
  value,
  tone,
  to,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  value: number | undefined;
  tone: Tone;
  to: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          {icon}
        </div>
        <ArrowRight
          className="h-4 w-4 -translate-x-1 text-stone-300 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-emerald-600"
          aria-hidden
        />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-stone-900">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-sm font-medium text-stone-700">{label}</p>
      <p className="text-xs text-stone-500">{hint}</p>
    </Link>
  );
}

function HealthTile({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  tone: Tone;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">
      <div className={`inline-flex items-center justify-center rounded-md p-1.5 ${TONES[tone]}`}>
        {icon}
      </div>
      <p className="mt-2 text-xl font-bold text-stone-900">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="text-[11px] text-stone-500">{hint}</p>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function ListCard({
  title,
  subtitle,
  icon,
  tone,
  link,
  loading,
  empty,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: Tone;
  link?: { to: string; label: string };
  loading?: boolean;
  empty: string;
  children: React.ReactNode;
}) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const hasContent = childrenArray.some((n) => n != null);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONES[tone]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900">{title}</p>
          <p className="truncate text-xs text-stone-500">{subtitle}</p>
        </div>
        {link && (
          <Link
            to={link.to}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            {link.label}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded bg-stone-100" />
          ))}
        </div>
      ) : !hasContent ? (
        <p className="mt-6 text-sm text-stone-500">{empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-stone-100">{children}</ul>
      )}
    </div>
  );
}

function QuickLink({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm font-medium ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15"
    >
      <span className="flex items-center gap-2">
        <span className="text-emerald-100">{icon}</span>
        {label}
      </span>
      <ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
    </Link>
  );
}

function computeInventoryHealth(products: Product[]) {
  let totalUnits = 0;
  let healthy = 0;
  let low = 0;
  let out = 0;
  for (const p of products) {
    totalUnits += p.stock_quantity;
    if (p.stock_quantity === 0) out += 1;
    else if (p.is_low_stock) low += 1;
    else healthy += 1;
  }
  return {
    totalUnits,
    healthy,
    low,
    out,
    total: healthy + low + out,
  };
}

function topByProductCount(categories: Category[], n: number) {
  return [...categories]
    .filter((c) => (c.product_count ?? 0) > 0)
    .sort((a, b) => (b.product_count ?? 0) - (a.product_count ?? 0))
    .slice(0, n);
}

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning, admin";
  if (h < 17) return "Good afternoon, admin";
  return "Good evening, admin";
}
