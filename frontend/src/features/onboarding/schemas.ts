import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Enter a valid phone (e.g. +919876543210)",
    ),
});

// Discriminated union — when account_type is "business", business_name becomes
// required. Individual users skip the extra fields entirely.
export const accountTypeSchema = z.discriminatedUnion("account_type", [
  z.object({ account_type: z.literal("individual") }),
  z.object({
    account_type: z.literal("business"),
    business_name: z.string().min(2, "Business name is required"),
    gstin: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || /^[0-9A-Z]{15}$/.test(v),
        "GSTIN must be 15 alphanumeric characters",
      ),
  }),
]);

export const addressSchema = z.object({
  line1: z.string().min(3, "Address line 1 is required"),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  country: z.string().default("IN"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type AccountTypeInput = z.infer<typeof accountTypeSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
