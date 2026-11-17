import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ApiErrorBody {
  message?: string | string[];
  code?: string;
}

/**
 * Checks whether an error comes from an RTK Query request.
 *
 * @param error - The error to check.
 * @returns True for FetchBaseQueryError.
 */
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

/**
 * Checks whether a failed request was rejected because the user is not signed in.
 *
 * @param error - The error returned by an RTK Query mutation or query.
 * @returns True for a 401 response.
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isFetchBaseQueryError(error) && error.status === 401;
}

/**
 * Reads the machine-readable code of a backend error
 * (for example "ORDER_NOT_PAYABLE" or "PAYMENT_NOT_FOUND").
 *
 * @param error - The error returned by an RTK Query mutation or query.
 * @returns The code, or undefined when the error has none.
 */
export function getApiErrorCode(error: unknown): string | undefined {
  if (!isFetchBaseQueryError(error)) {
    return undefined;
  }

  const code = (error.data as ApiErrorBody | undefined)?.code;

  return typeof code === "string" ? code : undefined;
}

/**
 * Builds a readable message from a backend error.
 * The backend answers { statusCode, error, code, message }, where message
 * can also be an array of validation messages.
 *
 * @param error - The error returned by an RTK Query mutation or query.
 * @param fallback - Message used when the error has no readable text.
 * @returns A message that can be shown to the user.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!isFetchBaseQueryError(error)) {
    return fallback;
  }

  if (error.status === "FETCH_ERROR") {
    return "Unable to reach the server. Check your connection and try again.";
  }

  if (error.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  const message = (error.data as ApiErrorBody | undefined)?.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return typeof message === "string" && message ? message : fallback;
}