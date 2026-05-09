/**
 * Signup page — centered card on an animated banana-leaf backdrop.
 *
 * After registering, the user lands on the home/storefront. Onboarding is
 * still reachable at /onboarding for users who want to fill in profile
 * details later.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { AuthBackground } from "@/components/auth/AuthBackground";
import { useRegister } from "@/features/auth/hooks";
import { signupSchema, type SignupInput } from "@/features/auth/schemas";

type ApiFieldErrors = { email?: string[]; password?: string[]; detail?: string };

export default function SignupPage() {
  const navigate = useNavigate();
  const register_ = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, formState, watch } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    await register_.mutateAsync({
      email: values.email,
      password: values.password,
    });
    navigate("/", { replace: true });
  });

  const apiErrors: ApiFieldErrors = isAxiosError(register_.error)
    ? (register_.error.response?.data ?? {})
    : {};

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
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

        <div
          className="rounded-3xl border border-white/40 bg-white p-7 sm:p-9"
          style={{
            boxShadow:
              "0 30px 80px -20px rgba(2, 44, 34, 0.55), 0 10px 30px -8px rgba(2, 44, 34, 0.35)",
          }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-200/70">
            <Leaf className="h-3.5 w-3.5" aria-hidden /> Create account
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-[2.1rem]">
            Start ordering today.
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            No fees, no commitments — just the freshest leaves shipped on
            your schedule.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <Field
              id="signup-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@plantation.com"
              icon={<Mail className="h-4 w-4" aria-hidden />}
              error={formState.errors.email?.message ?? apiErrors.email?.[0]}
              {...register("email")}
            />

            <div className="space-y-2">
              <Field
                id="signup-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 10 characters"
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
                error={
                  formState.errors.password?.message ?? apiErrors.password?.[0]
                }
                {...register("password")}
              />
              <PasswordChecklist password={password} />
            </div>

            <Field
              id="signup-confirm"
              label="Confirm password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="rounded p-1 text-stone-400 transition hover:text-stone-700"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              }
              error={formState.errors.confirm?.message}
              {...register("confirm")}
            />

            {apiErrors.detail && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {apiErrors.detail}
              </div>
            )}

            <button
              type="submit"
              disabled={register_.isPending}
              className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-base font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              <span className="relative">
                {register_.isPending ? "Creating your account…" : "Create account"}
              </span>
              <ArrowRight
                className="relative h-4 w-4 transition group-hover:translate-x-1"
                aria-hidden
              />
            </button>

            <p className="pt-2 text-center text-sm text-stone-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-emerald-50/80">
          We never share your details. Built with care, harvested with love.
        </p>
      </div>
    </div>
  );
}

/* ─── Field & checklist helpers ─────────────────────────────────────── */

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

function PasswordChecklist({ password }: { password: string }) {
  const rules = [
    { ok: password.length >= 10, label: "10 or more characters" },
    { ok: /[A-Za-z]/.test(password), label: "Contains a letter" },
    { ok: /[0-9]/.test(password), label: "Contains a number" },
  ];
  return (
    <ul className="grid grid-cols-1 gap-1 pl-1 sm:grid-cols-3">
      {rules.map((r) => (
        <li
          key={r.label}
          className={`flex items-center gap-1.5 text-[11px] transition ${
            r.ok ? "text-emerald-700" : "text-stone-400"
          }`}
        >
          <span
            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
              r.ok ? "bg-emerald-600 text-white" : "bg-stone-200"
            }`}
          >
            {r.ok && <Check className="h-2.5 w-2.5" aria-hidden />}
          </span>
          {r.label}
        </li>
      ))}
    </ul>
  );
}
