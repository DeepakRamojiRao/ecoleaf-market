/**
 * Home / landing page — mirrors the Figma hero exactly:
 *   - "Sustainable Living" pill chip
 *   - Big bold headline + body copy
 *   - "Shop Now" / "Learn More" CTAs
 *   - 3 stat tiles (Recyclable / Organic / Earth-Friendly)
 *   - Right-side photo (hands cradling a sapling)
 */
import { ArrowRight, Heart, Leaf, Recycle } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/common/Button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1400&q=80";

export default function HomePage() {
  return (
    <main className="page-gradient">
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        {/* Left: copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            <Leaf className="h-4 w-4" aria-hidden />
            Sustainable Living
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-stone-900 md:text-6xl">
            Live Green,
            <br />
            Shop Sustainably
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-600">
            Discover eco-friendly products that make a difference. Quality items
            designed for a sustainable lifestyle without compromising on style.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products">
              <Button size="lg">
                Shop Now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Stats row */}
          <ul className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            <Stat
              icon={<Recycle className="h-5 w-5 text-brand-600" aria-hidden />}
              value="100%"
              label="Recyclable"
            />
            <Stat
              icon={<Leaf className="h-5 w-5 text-brand-600" aria-hidden />}
              value="Organic"
              label="Materials"
            />
            <Stat
              icon={<Heart className="h-5 w-5 text-brand-600" aria-hidden />}
              value="Earth"
              label="Friendly"
            />
          </ul>
        </div>

        {/* Right: hero photo */}
        <div className="overflow-hidden rounded-3xl shadow-lg">
          <img
            src={HERO_IMAGE}
            alt="Hands cradling a young plant in dark soil"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-base font-semibold text-stone-900">{value}</div>
        <div className="text-xs text-stone-500">{label}</div>
      </div>
    </li>
  );
}
