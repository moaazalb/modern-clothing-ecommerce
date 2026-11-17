import { z } from "zod";

import { SHIPPING_COUNTRIES } from "@/lib/constants/shippingCountries";

const PHONE_CHARACTERS_REGEX = /^[+]?[0-9\s\-()]+$/;
const PHONE_DIGITS_REGEX = /^[+]?[0-9]{7,15}$/;

export const checkoutFormSchema = z.object({
  shippingName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(150, "Name must not exceed 150 characters."),

  shippingPhone: z
    .string()
    .trim()
    .refine(
      (value) =>
        PHONE_CHARACTERS_REGEX.test(value) &&
        PHONE_DIGITS_REGEX.test(value.replace(/[\s\-()]/g, "")),
      "Enter a valid phone number (7 to 15 digits, optional leading +).",
    ),

  shippingCountry: z
    .string()
    .refine(
      (code) => SHIPPING_COUNTRIES.some((country) => country.code === code),
      "Please choose a country.",
    ),

  shippingCity: z
    .string()
    .trim()
    .min(1, "City is required.")
    .max(100, "City must not exceed 100 characters."),

  shippingAddress: z
    .string()
    .trim()
    .min(1, "Address is required.")
    .max(300, "Address must not exceed 300 characters."),

  shippingNotes: z
    .string()
    .trim()
    .max(300, "Delivery notes must not exceed 300 characters.")
    .optional(),

  customerNote: z
    .string()
    .trim()
    .max(500, "Note must not exceed 500 characters.")
    .optional(),
  paymentMethod: z.enum(["COD", "ONLINE"]),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
