/**
 * Three-step onboarding form.
 *
 * Each step is its own self-contained <form> so RHF errors don't leak across
 * steps. Parent holds the cumulative state and only POSTs once on the final
 * step. The backend's OnboardingSerializer is atomic so partial saves are
 * impossible — either everything sticks or nothing does.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useOnboarding } from "@/features/onboarding/hooks";
import {
  accountTypeSchema,
  addressSchema,
  profileSchema,
  type AccountTypeInput,
  type AddressInput,
  type ProfileInput,
} from "@/features/onboarding/schemas";

const STEPS = ["Profile", "Account type", "Address"] as const;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const onboarding = useOnboarding();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileInput | null>(null);
  const [accountType, setAccountType] = useState<AccountTypeInput | null>(null);

  const submitAll = async (address: AddressInput) => {
    if (!profile || !accountType) return;
    await onboarding.mutateAsync({
      full_name: profile.full_name,
      phone: profile.phone,
      account_type: accountType.account_type,
      business:
        accountType.account_type === "business"
          ? {
              business_name: accountType.business_name,
              gstin: accountType.gstin || "",
            }
          : null,
      address,
    });
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-stone-900">
        Tell us about yourself
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        We'll use this to ship orders and reach you for bulk inquiries.
      </p>

      <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Onboarding progress">
        {STEPS.map((label, i) => (
          <li key={label} className="space-y-1">
            <div
              className={`h-1 rounded-full ${i <= step ? "bg-brand-600" : "bg-stone-200"}`}
            />
            <span
              className={`text-xs ${i === step ? "font-medium text-stone-700" : "text-stone-500"}`}
            >
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        {step === 0 && (
          <ProfileStep
            defaultValues={profile ?? undefined}
            onNext={(v) => {
              setProfile(v);
              setStep(1);
            }}
          />
        )}
        {step === 1 && (
          <AccountTypeStep
            defaultValues={accountType ?? undefined}
            onBack={() => setStep(0)}
            onNext={(v) => {
              setAccountType(v);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <AddressStep
            onBack={() => setStep(1)}
            onSubmit={submitAll}
            submitting={onboarding.isPending}
            error={onboarding.isError ? "Couldn't save. Check your inputs and try again." : null}
          />
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── Step 1 ─────────────────────────────
function ProfileStep({
  defaultValues,
  onNext,
}: {
  defaultValues?: ProfileInput;
  onNext: (v: ProfileInput) => void;
}) {
  const { register, handleSubmit, formState } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4" noValidate>
      <Input
        label="Full name"
        autoComplete="name"
        {...register("full_name")}
        error={formState.errors.full_name?.message}
      />
      <Input
        label="Phone"
        placeholder="+919876543210"
        autoComplete="tel"
        {...register("phone")}
        error={formState.errors.phone?.message}
        hint="With country code. We'll use this for WhatsApp order updates."
      />
      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

// ───────────────────────────── Step 2 ─────────────────────────────
function AccountTypeStep({
  defaultValues,
  onBack,
  onNext,
}: {
  defaultValues?: AccountTypeInput;
  onBack: () => void;
  onNext: (v: AccountTypeInput) => void;
}) {
  // Discriminated-union types make typing tricky here — cast for the form.
  const { register, handleSubmit, watch, formState } = useForm<AccountTypeInput>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues:
      defaultValues ??
      ({ account_type: "individual" } as AccountTypeInput),
  });
  const type = watch("account_type");
  const errors = formState.errors as Record<string, { message?: string } | undefined>;

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4" noValidate>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-stone-700">Account type</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 p-3 hover:bg-stone-50">
          <input
            type="radio"
            value="individual"
            className="mt-1"
            {...register("account_type")}
          />
          <div>
            <div className="text-sm font-medium">Individual</div>
            <div className="text-xs text-stone-500">For personal orders.</div>
          </div>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 p-3 hover:bg-stone-50">
          <input
            type="radio"
            value="business"
            className="mt-1"
            {...register("account_type")}
          />
          <div>
            <div className="text-sm font-medium">Business</div>
            <div className="text-xs text-stone-500">
              For bulk B2B orders and GST invoices.
            </div>
          </div>
        </label>
      </fieldset>

      {type === "business" && (
        <>
          <Input
            label="Business name"
            {...register("business_name" as never)}
            error={errors.business_name?.message}
          />
          <Input
            label="GSTIN (optional)"
            placeholder="22AAAAA0000A1Z5"
            {...register("gstin" as never)}
            error={errors.gstin?.message}
          />
        </>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

// ───────────────────────────── Step 3 ─────────────────────────────
function AddressStep({
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  onBack: () => void;
  onSubmit: (v: AddressInput) => void;
  submitting: boolean;
  error: string | null;
}) {
  const { register, handleSubmit, formState } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "IN" },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Address line 1"
        autoComplete="address-line1"
        {...register("line1")}
        error={formState.errors.line1?.message}
      />
      <Input
        label="Address line 2 (optional)"
        autoComplete="address-line2"
        {...register("line2")}
        error={formState.errors.line2?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City"
          autoComplete="address-level2"
          {...register("city")}
          error={formState.errors.city?.message}
        />
        <Input
          label="State"
          autoComplete="address-level1"
          {...register("state")}
          error={formState.errors.state?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Pincode"
          autoComplete="postal-code"
          {...register("pincode")}
          error={formState.errors.pincode?.message}
        />
        <Input
          label="Country"
          autoComplete="country"
          {...register("country")}
          error={formState.errors.country?.message}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={submitting}
        >
          Back
        </Button>
        <Button type="submit" loading={submitting}>
          Finish
        </Button>
      </div>
    </form>
  );
}
