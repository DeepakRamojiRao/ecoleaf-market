/**
 * Login page — centered card on an animated banana-leaf backdrop.
 *
 * Privilege follows `user.is_staff` from the backend response:
 *   staff -> /dashboard,  everyone else -> /
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { ArrowRight, Eye, EyeOff, Leaf, Lock, Mail } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthBackground } from "@/components/auth/AuthBackground";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await login.mutateAsync(values);
    const intended = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname;
    const fallback = res.user.is_staff ? "/admin/dashboard" : "/";
    navigate(intended ?? fallback, { replace: true });
  });

  const apiError =
    isAxiosError(login.error) && login.error.response?.status === 401
      ? "Invalid email or password."
      : isAxiosError(login.error)
        ? "Something went wrong. Try again."
        : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand mark — sits above the card on the dark backdrop */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-white/30"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))",
              backdropFilter: "blur(8px)",
            }}
          >
            <Leaf className="h-7 w-7 text-lime-200" aria-hidden />
          </div>
          <p className="text-xl font-semibold tracking-tight text-white">
            BananaLeaf Market
          </p>
          <p className="text-xs text-emerald-100/85">
            Fresh from the plantation
          </p>
        </div>

        {/* Centered form card */}
        <div
          className="rounded-3xl border border-white/40 bg-white p-7 sm:p-9"
          style={{
            boxShadow:
              "0 30px 80px -20px rgba(2, 44, 34, 0.55), 0 10px 30px -8px rgba(2, 44, 34, 0.35)",
          }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-200/70">
            <Leaf className="h-3.5 w-3.5" aria-hidden /> Sign in
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-[2.1rem]">
            Good to see you.
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            Pick up where you left off — your saved cart and orders are
            waiting.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <Field
              id="login-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@plantation.com"
              icon={<Mail className="h-4 w-4" aria-hidden />}
              error={formState.errors.email?.message}
              {...register("email")}
            />

            <Field
              id="login-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              icon={<Lock className="h-4 w-4" aria-hidden />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded p-1 text-stone-400 transition hover:text-stone-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              }
              error={formState.errors.password?.message}
              {...register("password")}
            />

            {apiError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-base font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              <span className="relative">
                {login.isPending ? "Signing you in…" : "Sign in"}
              </span>
              <ArrowRight
                className="relative h-4 w-4 transition group-hover:translate-x-1"
                aria-hidden
              />
            </button>

            <div className="relative py-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              <span className="relative z-10 bg-white px-3">New here?</span>
              <span className="absolute inset-x-0 top-1/2 h-px bg-stone-200" />
            </div>

            <Link
              to="/signup"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50"
            >
              Create your BananaLeaf account
            </Link>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-emerald-50/80">
          By signing in you agree to our terms and our farm-to-door policy.
        </p>
      </div>
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────────────────────── */

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, icon, trailing, error, id, className = "", ...rest },
  ref,
) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-stone-800"
      >
        {label}
      </label>
      <div
        className={`group flex items-center gap-2 rounded-xl border bg-stone-50/70 px-3.5 py-3 transition focus-within:bg-white focus-within:ring-2 ${
          error
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-100"
            : "border-stone-200 hover:border-stone-300 focus-within:border-emerald-500 focus-within:ring-emerald-100"
        }`}
      >
        {icon && (
          <span className="text-stone-400 transition group-focus-within:text-emerald-600">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={`flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none ${className}`}
          {...rest}
        />
        {trailing}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
