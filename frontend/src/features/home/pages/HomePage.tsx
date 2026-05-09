/**
 * Customer storefront — the page customers land on after sign-in.
 *
 *   1. Hero banner with primary CTA
 *   2. Trust strip (delivery / freshness / support / returns)
 *   3. Shop-by-category grid (live data — only top-level, active categories)
 *   4. Fresh arrivals product grid (live data — newest 8 active products)
 *   5. Editorial card / chef's pick tile
 *   6. Footer
 */
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChefHat,
  Headphones,
  Leaf,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  categoriesApi,
  productsApi,
  type Category,
  type Product,
} from "@/api/catalog";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=70";
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=70";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const categories = useQuery({
    queryKey: ["storefront", "categories"],
    queryFn: () =>
      categoriesApi.list({ ordering: "display_order", page_size: 12, parent: "null" }),
  });

  const featured = useQuery({
    queryKey: ["storefront", "featured"],
    queryFn: () =>
      productsApi.list({ ordering: "-created_at", page_size: 8 }),
  });

  const greeting = greetingFor(new Date());

  return (
    <main className="bg-white">
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: [
              "radial-gradient(circle at 12% 18%, rgba(190, 242, 100, 0.45) 0%, transparent 38%)",
              "radial-gradient(circle at 92% 78%, rgba(56, 189, 248, 0.32) 0%, transparent 42%)",
              "radial-gradient(circle at 60% 8%, rgba(253, 224, 71, 0.28) 0%, transparent 38%)",
              "linear-gradient(135deg, #ecfdf5 0%, #ffffff 60%, #f0fdf4 100%)",
            ].join(", "),
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-16 lg:py-20">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800 ring-1 ring-emerald-200/70">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {greeting}
              {user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Fresh banana leaves,{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                hand-picked daily.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 sm:text-lg">
              From plantation to plate in 48 hours. Browse premium leaves in
              every cut and size — vacuum-packed, food-safe, and ready for your
              next feast or thali.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden />
                Shop now
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                to="/products?deals=1"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-base font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                Today's deals
              </Link>
            </div>

            {/* Trust signals */}
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 text-center text-stone-600">
              <Stat label="Daily picks" value="1,200+" />
              <Stat label="Farm to door" value="48 hrs" />
              <Stat label="Order accuracy" value="98%" />
            </dl>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ─── Trust strip ─────────────────────────────────────── */}
      <section className="border-y border-stone-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-2 divide-stone-100 px-6 py-6 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          <Pillar icon={<Truck className="h-5 w-5" aria-hidden />} title="Free delivery" sub="On orders over ₹499" />
          <Pillar icon={<Leaf className="h-5 w-5" aria-hidden />} title="Plantation-fresh" sub="Cut on the same day you order" />
          <Pillar icon={<Headphones className="h-5 w-5" aria-hidden />} title="Real support" sub="WhatsApp us, anytime" />
          <Pillar icon={<RotateCcw className="h-5 w-5" aria-hidden />} title="Easy returns" sub="Not happy? Full refund — no fuss" />
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          right={
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
            >
              See all <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />

        {categories.isLoading ? (
          <CategoriesSkeleton />
        ) : (categories.data?.results.length ?? 0) === 0 ? (
          <EmptyTile message="No categories yet — check back soon." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.data!.results.slice(0, 6).map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Featured products ───────────────────────────────── */}
      <section className="border-t border-stone-100 bg-stone-50/60">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <SectionHeader
            eyebrow="Hand-picked"
            title="Fresh from the plantation"
            right={
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
              >
                View all products <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />

          {featured.isLoading ? (
            <ProductsSkeleton />
          ) : (featured.data?.results.length ?? 0) === 0 ? (
            <EmptyTile message="The first batch is being prepared." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.data!.results.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Editorial / chef's pick ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div
          className="overflow-hidden rounded-3xl text-white shadow-xl"
          style={{
            background:
              "radial-gradient(circle at 80% 0%, rgba(190, 242, 100, 0.35) 0%, transparent 45%), linear-gradient(120deg, #14532d 0%, #166534 60%, #047857 100%)",
          }}
        >
          <div className="grid items-center gap-8 p-8 sm:p-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/25 backdrop-blur">
                <ChefHat className="h-3.5 w-3.5" aria-hidden />
                Chef's pick
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Hosting a thali night?
              </h2>
              <p className="mt-3 max-w-md text-emerald-50/90">
                Our XL leaves are cut at sunrise, packed with care, and on your
                doorstep before dinner. Order in bulk and save up to 22%.
              </p>
              <Link
                to="/products?bulk=1"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Explore bulk packs
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ChefVisual />
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-stone-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 text-sm text-stone-600 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                <Leaf className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-base font-semibold tracking-tight text-stone-900">
                BananaLeaf Market
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Family plantations, transparent pricing, and a dependable cold
              chain — fresh produce shouldn't be complicated.
            </p>
          </div>
          <FooterCol title="Shop">
            <FooterLink to="/products">All products</FooterLink>
            <FooterLink to="/products?bulk=1">Bulk orders</FooterLink>
            <FooterLink to="/products?deals=1">Deals</FooterLink>
          </FooterCol>
          <FooterCol title="Customer care">
            <FooterLink to="/onboarding">Update profile</FooterLink>
            <FooterLink to="/cart">Your cart</FooterLink>
            <FooterLink to="#">Track an order</FooterLink>
          </FooterCol>
          <FooterCol title="Company">
            <FooterLink to="#">Story</FooterLink>
            <FooterLink to="#">Suppliers</FooterLink>
            <FooterLink to="#">Contact</FooterLink>
          </FooterCol>
        </div>
        <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} BananaLeaf Market. Every leaf, harvested with care.
        </div>
      </footer>
    </main>
  );
}

/* ─── Subcomponents ─────────────────────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const params = new URLSearchParams({ category: String(category.id) });
  return (
    <Link
      to={`/products?${params.toString()}`}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-stone-100">
        <img
          src={category.image_url || DEFAULT_CATEGORY_IMAGE}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="px-3 py-3">
        <p className="text-sm font-semibold text-stone-900">{category.name}</p>
        <p className="mt-0.5 text-xs text-stone-500">
          {category.product_count ?? 0} products
        </p>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: Product }) {
  const out = product.stock_quantity === 0;
  const low = product.is_low_stock && !out;
  return (
    <Link
      to={`/products?focus=${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={product.image_url || DEFAULT_PRODUCT_IMAGE}
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

        {/* Stars (cosmetic for now; real ratings ship later) */}
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
              // The cart isn't wired yet — preventDefault so the card link
              // doesn't navigate when the button is clicked.
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

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
        >
          <div className="aspect-square animate-pulse bg-stone-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-2/3 animate-pulse rounded bg-stone-100" />
            <div className="h-2 w-1/3 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
  );
}

function EmptyTile({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
      {message}
    </div>
  );
}

function Pillar({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="text-xs text-stone-500">{sub}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xl font-bold tracking-tight text-stone-900">{value}</dt>
      <dd className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
        {label}
      </dd>
    </div>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
        {title}
      </p>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={to}
        className="text-stone-600 transition hover:text-emerald-700"
      >
        {children}
      </Link>
    </li>
  );
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "Late-night browsing";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Hero / chef visuals (SVG so we don't pull a heavy asset) ─── */

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square max-w-md">
      {/* Backdrop disc */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(187, 247, 208, 0.6) 0%, rgba(187, 247, 208, 0) 70%), radial-gradient(circle at 70% 70%, rgba(56, 189, 248, 0.25) 0%, transparent 65%)",
        }}
      />
      {/* Big banana leaf */}
      <Leafy size="86%" rotate={-12} top="6%" left="-4%" opacity={0.9} />
      {/* Smaller accents */}
      <Leafy size="46%" rotate={36} top="18%" right="-2%" opacity={0.8} />
      <Leafy size="40%" rotate={-50} bottom="2%" left="22%" opacity={0.85} />
    </div>
  );
}

function ChefVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(190, 242, 100, 0.25), transparent 60%), radial-gradient(circle at 70% 70%, rgba(56, 189, 248, 0.2), transparent 60%)",
        }}
      />
      <Leafy size="84%" rotate={-10} top="4%" left="2%" opacity={0.95} />
      <Leafy size="40%" rotate={45} bottom="6%" right="6%" opacity={0.9} />
    </div>
  );
}

function Leafy({
  size,
  top,
  left,
  right,
  bottom,
  rotate = 0,
  opacity = 1,
}: {
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate?: number;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 200 240"
      className="absolute drop-shadow-md"
      style={{
        width: size,
        height: "auto",
        top,
        left,
        right,
        bottom,
        transform: `rotate(${rotate}deg)`,
        opacity,
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`hero-leaf-${rotate}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="55%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <path
        d="M100 6 C 32 70, 18 162, 100 234 C 182 162, 168 70, 100 6 Z"
        fill={`url(#hero-leaf-${rotate})`}
      />
      <path
        d="M100 14 L 100 230"
        stroke="#022c22"
        strokeOpacity="0.4"
        strokeWidth="2.4"
        fill="none"
      />
      {[36, 66, 96, 126, 156, 186].map((y) => (
        <g key={y}>
          <path
            d={`M100 ${y} Q 70 ${y + 14} 44 ${y + 32}`}
            stroke="#022c22"
            strokeOpacity="0.3"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d={`M100 ${y} Q 130 ${y + 14} 156 ${y + 32}`}
            stroke="#022c22"
            strokeOpacity="0.3"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
      ))}
    </svg>
  );
}
