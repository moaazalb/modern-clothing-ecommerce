
"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { setUser } from "@/features/auth/store/authSlice";
import { useGetMeQuery, useUpdateUserMutation } from "@/features/users/api/usersApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/**
 * Profile form values.
 */
interface ProfileFormValues {
  firstName: string;
  lastName: string;
  avatar: string;
}

/**
 * Extracts a readable error message from an RTK Query error.
 *
 * @param error - The error returned by RTK Query.
 * @returns A readable error message.
 */
function getProfileErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data = error.data;

    if (typeof data === "object" && data !== null && "message" in data) {
      const message = data.message;

      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(", ");
    }
  }

  return "Something went wrong. Please try again.";
}

/**
 * Displays and updates the authenticated user's profile.
 *
 * @returns {ReactElement} The profile page.
 */
export default function ProfilePage(): ReactElement {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector((state) => state.auth.status);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    data: user,
    isLoading,
    isError,
  } = useGetMeQuery(undefined, {
    skip: authStatus !== "authenticated",
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      avatar: "",
    },
  });

  /**
   * Updates the form whenever the user's profile data changes.
   */
  useEffect(() => {
    if (!user) return;

    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar ?? "",
    });
  }, [user, reset]);

  /**
   * Redirects unauthenticated users to the login page.
   */
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  /**
   * Submits the updated profile information.
   *
   * @param values - The validated profile form values.
   * @returns {Promise<void>}
   */
  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    if (!user) return;

    setApiError(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await updateUser({
        id: user.id,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        avatar: values.avatar.trim() || null,
      }).unwrap();

      dispatch(setUser(updatedUser));

      reset({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar ?? "",
      });

      setSuccessMessage("Your profile has been updated successfully.");
    } catch (error) {
      setApiError(getProfileErrorMessage(error));
    }
  };

  if (authStatus === "unknown" || authStatus === "unauthenticated") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking authentication...
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading your profile...
        </p>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-red-600">
          Failed to load your profile. Please try again.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Account Settings
          </p>

          <h1 className="font-serif text-3xl font-semibold text-slate-800 sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Manage your personal information and keep your account details
            up to date.
          </p>
        </div>

        {/* Profile Form */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the information associated with your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First Name
              </label>

              <input
                id="firstName"
                type="text"
                maxLength={100}
                {...register("firstName", {
                  required: "First name is required.",
                  maxLength: {
                    value: 100,
                    message: "First name must not exceed 100 characters.",
                  },
                })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last Name
              </label>

              <input
                id="lastName"
                type="text"
                maxLength={100}
                {...register("lastName", {
                  required: "Last name is required.",
                  maxLength: {
                    value: 100,
                    message: "Last name must not exceed 100 characters.",
                  },
                })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
              />

              <p className="mt-1 text-xs text-slate-400">
                Email address cannot currently be changed here.
              </p>
            </div>

            {/* Avatar */}
            <div>
              <label
                htmlFor="avatar"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Profile Image URL
              </label>

              <input
                id="avatar"
                type="url"
                maxLength={500}
                placeholder="https://example.com/avatar.jpg"
                {...register("avatar", {
                  maxLength: {
                    value: 500,
                    message: "Avatar URL must not exceed 500 characters.",
                  },
                  validate: (value) =>
                    !value ||
                    /^https?:\/\/.+/i.test(value) ||
                    "Please enter a valid HTTP or HTTPS URL.",
                })}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              {errors.avatar && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.avatar.message}
                </p>
              )}
            </div>

            {/* Feedback */}
            {apiError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {apiError}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              >
                {successMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() =>
                  reset({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar ?? "",
                  })
                }
                disabled={!isDirty || isUpdating}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={!isDirty || isUpdating}
                className="rounded-lg bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
