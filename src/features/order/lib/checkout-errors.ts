import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { getApiErrorMessage } from "@/lib/api/getApiErrorMessage";

import type { CheckoutUnavailableItem } from "../types/order.types";

interface CheckoutErrorBody {
  code?: string;
  items?: CheckoutUnavailableItem[];
}

/**
 * What the checkout form shows after a failed attempt.
 */
export interface CheckoutFailure {
  message: string;
  unavailableItems: CheckoutUnavailableItem[];
}

/**
 * Checks whether an error comes from an RTK Query request.
 *
 * @param error - The error to check.
 * @returns True for FetchBaseQueryError.
 */
function isQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

/**
 * Turns a failed order request into something the form can show.
 *
 * @param error - The error returned by the createOrder mutation.
 * @returns A message and, for a 409, the items that cannot be ordered.
 */
export function getCheckoutFailure(error: unknown): CheckoutFailure {
  if (isQueryError(error)) {
    if (error.status === 429) {
      return {
        message: "Too many attempts. Please wait a minute and try again.",
        unavailableItems: [],
      };
    }

    if (error.status === "FETCH_ERROR") {
      return {
        message:
          "Connection problem. Your order may have been placed: check My Orders, or press Place order again to retry safely.",
        unavailableItems: [],
      };
    }

    const body = error.data as CheckoutErrorBody | undefined;

    if (
      body?.code === "CHECKOUT_ITEMS_UNAVAILABLE" &&
      Array.isArray(body.items)
    ) {
      return {
        message: "Some items in your bag can no longer be ordered.",
        unavailableItems: body.items,
      };
    }
  }

  return { message: getApiErrorMessage(error), unavailableItems: [] };
}

/**
 * Describes why a cart line could not be ordered.
 *
 * @param item - The unavailable line.
 * @returns A short sentence.
 */
export function describeUnavailableItem(item: CheckoutUnavailableItem): string {
  const name = item.productName ?? item.sku ?? "An item";

  if (item.issue === "INSUFFICIENT_STOCK") {
    return `${name}: only ${item.available} left in stock.`;
  }

  if (item.issue === "OUT_OF_STOCK") {
    return `${name}: out of stock.`;
  }

  return `${name}: no longer available.`;
}