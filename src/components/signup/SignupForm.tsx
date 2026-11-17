"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  signupFormSchema,
  type SignupFormValues,
} from "@/lib/validations/auth.schema";

import { useCreateUserMutation } from "@/features/users/api/usersApi";

const INPUT_CLASS =
  "w-full rounded-lg border border-[#E8D8C3] bg-[#F8F4ED] px-4 py-3 text-sm text-[#4B3621] outline-none transition-all placeholder:text-[#806B56]/60 hover:border-[#D6B58A] focus:border-[#A87945] focus:ring-2 focus:ring-[#A87945]/20";

/**
 * Reusable signup input configuration.
 */
interface SignupFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

/**
 * Reusable labelled signup input with validation feedback.
 *
 * @param {SignupFieldProps} props - The input configuration.
 * @returns {JSX.Element} The signup input.
 */
function SignupField({
  id,
  label,
  type = "text",
  placeholder,
  registration,
  error,
}: SignupFieldProps): ReactElement {
  const autoComplete =
    id === "firstName"
      ? "given-name"
      : id === "lastName"
        ? "family-name"
        : id === "email"
          ? "email"
          : "new-password";

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#4B3621]"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${INPUT_CLASS} ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : ""
        }`}
        {...registration}
      />

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Extracts a readable error message from an RTK Query error.
 *
 * @param {unknown} error - The API error.
 * @returns {string} A readable error message.
 */
function getSignupErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "Something went wrong. Please try again.";
  }

  if ("status" in error && error.status === 409) {
    return "An account with this email already exists.";
  }

  if ("data" in error) {
    const data = error.data;

    if (typeof data === "object" && data !== null && "message" in data) {
      const message = data.message;

      if (typeof message === "string") {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(", ");
      }
    }
  }

  return "Something went wrong. Please try again.";
}

/**
 * Registration form connected to the users API.
 *
 * @returns {JSX.Element} The signup form.
 */
export function SignupForm(): ReactElement {
  const router = useRouter();

  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatar: "",
    },
    mode: "onChange",
  });

  /**
   * Creates a new user account.
   *
   * @param {SignupFormValues} values - The validated signup form values.
   * @returns {Promise<void>}
   */
  const onSubmit = async (values: SignupFormValues): Promise<void> => {
    clearErrors("root.server");

    try {
      await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        ...(values.avatar?.trim() ? { avatar: values.avatar.trim() } : {}),
      }).unwrap();

      router.replace("/login?registered=true");
    } catch (error: unknown) {
      setError("root.server", {
        type: "server",
        message: getSignupErrorMessage(error),
      });
    }
  };

  return (
    <section className="flex min-h-[75vh] w-full items-center justify-center bg-[#F8F4ED] px-4 py-10 sm:px-6 sm:py-14">
      <div className="w-full max-w-lg rounded-2xl border border-[#E8D8C3] bg-white p-5 shadow-lg shadow-[#4B3621]/5 sm:p-8 lg:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#4B3621] sm:text-3xl">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-[#806B56] sm:text-base">
            Create your account and start shopping with us.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <SignupField
            id="firstName"
            label="First Name"
            placeholder="Enter your first name"
            registration={register("firstName")}
            error={errors.firstName?.message}
          />

          <SignupField
            id="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            registration={register("lastName")}
            error={errors.lastName?.message}
          />

          <SignupField
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            registration={register("email")}
            error={errors.email?.message}
          />

          <SignupField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            registration={register("password")}
            error={errors.password?.message}
          />

          <SignupField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <SignupField
            id="avatar"
            label="Profile Image URL (Optional)"
            type="url"
            placeholder="https://example.com/image.jpg"
            registration={register("avatar")}
            error={errors.avatar?.message}
          />

          <p className="text-xs leading-5 text-[#806B56]">
            Password must contain between 8 and 72 characters.
          </p>

          {errors.root?.server?.message && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {errors.root.server.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={!isValid || isSubmitting || isLoading}
            className="mt-2 h-12 w-full border border-[#A87945] bg-[#A87945] text-base font-semibold text-white shadow-sm transition-all duration-300 hover:border-[#4B3621] hover:bg-[#4B3621] disabled:cursor-not-allowed disabled:border-[#D6B58A] disabled:bg-[#E8D8C3] disabled:text-[#806B56]"
          >
            {isSubmitting || isLoading
              ? "Creating Account..."
              : "Create Account"}
          </Button>
        </form>

        <div className="mt-7 border-t border-[#E8D8C3] pt-6 text-center">
          <p className="text-sm text-[#806B56]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#A87945] transition-colors hover:text-[#4B3621] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
