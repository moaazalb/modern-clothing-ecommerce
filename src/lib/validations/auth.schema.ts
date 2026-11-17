import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .max(255, "Email must not exceed 255 characters.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must not exceed 72 characters.");

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(100, "First name must not exceed 100 characters."),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(100, "Last name must not exceed 100 characters."),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    avatar: z
      .string()
      .trim()
      .max(500, "Avatar URL must not exceed 500 characters.")
      .optional()
      .or(z.literal("")),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;