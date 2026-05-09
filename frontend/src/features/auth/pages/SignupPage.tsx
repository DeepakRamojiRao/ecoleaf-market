import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Leaf } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useRegister } from "@/features/auth/hooks";
import { signupSchema, type SignupInput } from "@/features/auth/schemas";

type ApiFieldErrors = { email?: string[]; password?: string[]; detail?: string };

export default function SignupPage() {
  const navigate = useNavigate();
  const register_ = useRegister();
  const { register, handleSubmit, formState } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    await register_.mutateAsync({
      email: values.email,
      password: values.password,
    });
    // Match the Figma demo: drop straight onto the home page after signup.
    // Onboarding stays accessible at /onboarding for users who want to
    // complete their profile later.
    navigate("/", { replace: true });
  });

  const apiErrors: ApiFieldErrors = isAxiosError(register_.error)
    ? (register_.error.response?.data ?? {})
    : {};

  return (
    <div className="page-gradient flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <Leaf className="h-7 w-7 text-brand-600" aria-hidden />
          </div>
          <h1 className="text-center text-2xl font-bold text-stone-900">
            Join EcoShop
          </h1>
          <p className="mt-1 text-center text-sm text-stone-500">
            Create your account to start shopping sustainably
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              {...register("email")}
              error={formState.errors.email?.message ?? apiErrors.email?.[0]}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              error={formState.errors.password?.message ?? apiErrors.password?.[0]}
              hint="At least 10 characters with letters and numbers."
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              {...register("confirm")}
              error={formState.errors.confirm?.message}
            />
            {apiErrors.detail && (
              <p className="text-sm text-danger-600">{apiErrors.detail}</p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={register_.isPending}
            >
              Create Account
            </Button>
            <p className="pt-2 text-center text-sm text-stone-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-brand-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
