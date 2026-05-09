/**
 * Login page — restyled to match the EcoShop Figma.
 *
 *   - Mint avatar + "Welcome to EcoShop" heading
 *   - Email + Password fields (gray-filled style)
 *   - "Login as" Customer / Admin role selector
 *   - Big green Sign In button
 *   - Demo Mode info banner with sign-up link
 *
 * Role-toggle semantics:
 *   The radio is a *routing hint*, not a privilege grant. Privilege is
 *   determined by `user.is_staff` returned from the backend. If a user
 *   picks "Admin" but their account isn't staff, we route them to / and
 *   surface a soft warning.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

type Role = "customer" | "admin";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [role, setRole] = useState<Role>("customer");
  const [postLoginNotice, setPostLoginNotice] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setPostLoginNotice(null);
    const res = await login.mutateAsync(values);
    const intended = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname;

    if (role === "admin") {
      if (res.user.is_staff) {
        navigate(intended ?? "/dashboard", { replace: true });
        return;
      }
      // Logged in successfully, but not a staff account — fall through to home
      // and surface the discrepancy.
      setPostLoginNotice(
        "Your account doesn't have admin access. Redirecting to home.",
      );
      setTimeout(() => navigate("/", { replace: true }), 1500);
      return;
    }
    navigate(intended ?? "/", { replace: true });
  });

  const apiError =
    isAxiosError(login.error) && login.error.response?.status === 401
      ? "Invalid email or password."
      : isAxiosError(login.error)
        ? "Something went wrong. Try again."
        : null;

  return (
    <div className="page-gradient flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <UserIcon className="h-7 w-7 text-brand-600" aria-hidden />
          </div>
          <h1 className="text-center text-2xl font-bold text-stone-900">
            Welcome to EcoShop
          </h1>
          <p className="mt-1 text-center text-sm text-stone-500">
            Sign in to continue
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              {...register("email")}
              error={formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              error={formState.errors.password?.message}
            />

            {/* Role selector */}
            <div>
              <p className="mb-2 text-sm font-medium text-stone-900">Login as</p>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  selected={role === "customer"}
                  onClick={() => setRole("customer")}
                  icon={<UserIcon className="h-5 w-5" aria-hidden />}
                  label="Customer"
                />
                <RoleCard
                  selected={role === "admin"}
                  onClick={() => setRole("admin")}
                  icon={<Shield className="h-5 w-5" aria-hidden />}
                  label="Admin"
                />
              </div>
            </div>

            {apiError && <p className="text-sm text-danger-600">{apiError}</p>}
            {postLoginNotice && (
              <p className="text-sm text-warn-600">{postLoginNotice}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={login.isPending}
            >
              Sign In
            </Button>

            {/* Demo banner */}
            <div className="rounded-md bg-blue-50 p-3 text-xs text-stone-700">
              <span className="font-semibold text-blue-700">Demo Mode:</span>{" "}
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-brand-700 hover:underline"
              >
                Sign up
              </Link>{" "}
              to start shopping. Choose your role above.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 px-4 py-4 text-sm font-medium transition ${
        selected
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
