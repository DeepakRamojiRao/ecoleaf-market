import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

/**
 * Filled input — light gray background, no border by default. Matches the
 * Figma's subtle filled look. Error state surfaces a red ring + message.
 */
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className = "", id, ...rest },
  ref,
) {
  const inputId = id || (rest.name as string | undefined);
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-stone-900"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={`block w-full rounded-md bg-stone-100 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
          error
            ? "ring-1 ring-danger-500 focus:ring-danger-500"
            : "focus:ring-brand-500"
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
});
