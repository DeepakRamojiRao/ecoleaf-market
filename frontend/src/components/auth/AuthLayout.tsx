import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ title: string; subtitle?: string }>;

/**
 * Centered card on a soft green→blue gradient page. The card holds the
 * sign-in form and any post-login role choices.
 */
export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="page-gradient flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* Avatar / brand badge centered above the title. */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            {/* Slot — page provides the icon */}
            <BrandSlot />
          </div>
          <h1 className="text-center text-2xl font-bold text-stone-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-center text-sm text-stone-500">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Default badge is a leaf — pages can override by composing their own layout.
import { Leaf } from "lucide-react";
function BrandSlot() {
  return <Leaf className="h-7 w-7 text-brand-600" aria-hidden />;
}
