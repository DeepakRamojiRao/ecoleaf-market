import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Crumb = { label: string; to?: string };

type Props = {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, breadcrumbs = [], actions }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex items-center gap-1 text-xs text-stone-500"
          >
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1 hover:text-emerald-700"
            >
              <Home className="h-3.5 w-3.5" aria-hidden />
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 text-stone-300" aria-hidden />
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-emerald-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-stone-700">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
