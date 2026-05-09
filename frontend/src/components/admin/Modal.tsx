/**
 * Lightweight modal — fixed overlay + centered dialog. Closes on Escape and
 * on backdrop click. Body scroll is locked while open.
 */
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Default "md" (~28rem). Use "lg" for forms with many fields. */
  size?: "sm" | "md" | "lg";
};

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, children, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
      />
      <div
        className={`relative w-full ${SIZES[size]} animate-[modal-pop_0.18s_ease-out] rounded-2xl bg-white shadow-2xl shadow-stone-900/30`}
      >
        <div className="flex items-start gap-4 border-b border-stone-100 p-5">
          <div className="flex-1">
            <h2
              id="modal-title"
              className="text-lg font-semibold tracking-tight text-stone-900"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-stone-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
      <style>{`@keyframes modal-pop { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}
