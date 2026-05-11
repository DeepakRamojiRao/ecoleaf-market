/**
 * Customer-facing product browse page.
 *
 *   - Left rail (lg+) : category filter + price slider
 *   - Top    : sort + result count + active filter chips
 *   - Grid   : product cards (live from /catalog/products)
 *
 * Reads the initial filter state from the URL query (?search=, ?category=)
 * so links from the storefront landing page work intuitively.
 */
import { useQuery } from "@tanstack/react-query";
import { Filter, Search, ShoppingCart, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  categoriesApi,
  productsApi,
  type Product,
} from "@/api/catalog";

const PAGE_SIZE = 12;
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=70";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "-created_at", label: "Newest first" },
  { value: "name", label: "Name (A–Z)" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
];

export default function ProductsBrowsePage() {
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState<string>(params.get("category") ?? "");
  const [ordering, setOrdering] = useState<string>("-created_at");
  const [page, setPage] = useState(1);

  // Reflect search/category back into the URL (so reload + share-link works).
  useEffect(() => {
    const next: Record<string, string> = {};
    if (search) next.search = search;
    if (category) next.category = category;
    setParams(next, { replace: true });
  }, [search, category, setParams]);

  const categories = useQuery({
    queryKey: ["browse", "categories"],
    queryFn: () => categoriesApi.list({ ordering: "display_order", page_size: 100 }),
  });

  const products = useQuery({
    queryKey: ["browse", "products", { search, category, ordering, page }],
    queryFn: () =>
      productsApi.list({
        search: search || undefined,
        category: category ? Number(category) : undefined,
        ordering,
        page,
        page_size: PAGE_SIZE,
      }),
  });

  const total = products.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const activeCategory = useMemo(
    () =>
      categories.data?.results.find((c) => String(c.id) === category) ?? null,
    [categories.data, category],
  );

  return (
    <main className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Storefront
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {activeCategory ? activeCategory.name : "All products"}
            </h1>
            {activeCategory?.description && (
              <p className="mt-1 max-w-2xl text-sm text-stone-600">
                {activeCategory.description}
              </p>
            )}
          </div>
          <p className="text-sm text-stone-500">
            <strong className="text-stone-900">{total}</strong> result
            {total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          {/* Left rail filters */}
          <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-stone-500">
              <Filter className="h-3.5 w-3.5" aria-hidden /> Refine
            </h2>

            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600">
                Search
              </label>
              <div className="relative mt-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products…"
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600">
                Category
              </label>
              <div className="mt-2 max-h-72 space-y-1 overflow-auto pr-1">
                <CategoryRadio
                  label="All categories"
                  value=""
                  checked={category === ""}
                  onChange={() => {
                    setCategory("");
                    setPage(1);
                  }}
                />
                {categories.data?.results.map((c) => (
                  <CategoryRadio
                    key={c.id}
                    label={c.name}
                    badge={c.product_count ?? 0}
                    value={String(c.id)}
                    checked={category === String(c.id)}
                    onChange={() => {
                      setCategory(String(c.id));
                      setPage(1);
                    }}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Grid + sort */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-stone-500">
                Showing page <strong className="text-stone-900">{page}</strong> of{" "}
                <strong className="text-stone-900">{totalPages}</strong>
              </p>
              <label className="inline-flex items-center gap-2 text-sm">
                <span className="text-stone-500">Sort by</span>
                <select
                  value={ordering}
                  onChange={(e) => {
                    setOrdering(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {products.isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
                  >
                    <div className="aspect-square animate-pulse bg-stone-100" />
                    <div className="space-y-2 p-4">
                      <div className="h-2 w-1/3 animate-pulse rounded bg-stone-100" />
                      <div className="h-3 w-3/4 animate-pulse rounded bg-stone-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (products.data?.results.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center">
                <p className="text-sm font-medium text-stone-600">
                  No products match your filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setPage(1);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {products.data!.results.map((p) => (
                    <ProductTile key={p.id} product={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium hover:border-emerald-300 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-stone-500">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium hover:border-emerald-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function CategoryRadio({
  label,
  value,
  checked,
  onChange,
  badge,
}: {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
        checked
          ? "bg-emerald-50 font-semibold text-emerald-800"
          : "text-stone-700 hover:bg-stone-50"
      }`}
    >
      <span className="truncate text-left">{label}</span>
      {badge != null && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            checked ? "bg-emerald-200 text-emerald-900" : "bg-stone-100 text-stone-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function ProductTile({ product }: { product: Product }) {
  const out = product.stock_quantity === 0;
  const low = product.is_low_stock && !out;
  return (
    <Link
      to={`#`}
      onClick={(e) => e.preventDefault()}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={product.image_display_url || DEFAULT_PRODUCT_IMAGE}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {out ? (
          <span className="absolute left-2 top-2 rounded-full bg-stone-900/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Sold out
          </span>
        ) : low ? (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Few left
          </span>
        ) : (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Fresh
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          {product.category_name ?? "—"}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-stone-900">
          {product.name}
        </p>

        <div className="mt-2 flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
          ))}
          <span className="ml-1 text-[11px] font-medium text-stone-500">(48)</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="text-lg font-bold text-stone-900">₹{product.price}</p>
          <button
            type="button"
            disabled={out}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-emerald-600 px-3 text-xs font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
