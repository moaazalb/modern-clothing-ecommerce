
"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import {
  useFailMockPaymentMutation,
  useGetMockPaymentQuery,
  useSucceedMockPaymentMutation,
} from "@/features/payment/api/mockPaymentApi";
import { getApiErrorMessage } from "@/lib/api/getApiErrorMessage";

interface MockPaymentPageClientProps {
  providerPaymentId: string;
  orderId: string;
}

/**
 * Formats a payment amount using the currency returned by the backend.
 *
 * @param amount - Payment amount as a decimal string.
 * @param currency - ISO currency code.
 * @returns Formatted payment amount.
 */
function formatPaymentAmount(amount: string, currency: string): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${amount} ${currency}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(numericAmount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/**
 * Returns a readable label for a payment status.
 *
 * @param status - Current payment status.
 * @returns Human-readable status.
 */
function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Waiting for payment",
    SUCCEEDED: "Payment successful",
    FAILED: "Payment failed",
    EXPIRED: "Payment session expired",
    REFUND_PENDING: "Refund pending",
    REFUNDED: "Refunded",
  };

  return labels[status] ?? status;
}

/**
 * Development-only mock payment page.
 *
 * The backend is responsible for changing payment and order states.
 * This component only requests the mock gateway actions.
 *
 * @param props - Mock payment session identifiers.
 * @returns Mock payment interface.
 */
export function MockPaymentPageClient({
  providerPaymentId,
  orderId,
}: MockPaymentPageClientProps): ReactElement {
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetMockPaymentQuery(providerPaymentId, {
    refetchOnMountOrArgChange: true,
  });

  const [succeedPayment, succeedState] = useSucceedMockPaymentMutation();
  const [failPayment, failState] = useFailMockPaymentMutation();

  const isActionLoading = succeedState.isLoading || failState.isLoading;
  const isPending = session?.status === "PENDING";

  /**
   * Sends a successful-payment event to the backend mock gateway.
   *
   * @returns Promise resolved when the action has been processed.
   */
  async function handleSucceed(): Promise<void> {
    setActionError(null);
    setActionMessage(null);

    try {
      await succeedPayment({ providerPaymentId, orderId }).unwrap();
      await refetch();
      setActionMessage("The successful payment event was sent.");
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError));
    }
  }

  /**
   * Sends a failed-payment event to the backend mock gateway.
   *
   * @returns Promise resolved when the action has been processed.
   */
  async function handleFail(): Promise<void> {
    setActionError(null);
    setActionMessage(null);

    try {
      await failPayment({ providerPaymentId, orderId }).unwrap();
      await refetch();
      setActionMessage("The declined payment event was sent.");
    } catch (requestError: unknown) {
      setActionError(getApiErrorMessage(requestError));
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4">
        <p role="status" className="text-sm text-[#806B56]">
          Loading payment session...
        </p>
      </main>
    );
  }

  if (isError || !session) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4">
        <div
          role="alert"
          className="w-full rounded-xl border border-red-200 bg-red-50 p-5 text-center"
        >
          <h1 className="text-lg font-semibold text-red-800">
            Payment session not found
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {getApiErrorMessage(error)}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Retrying..." : "Try again"}
          </Button>

          <Button asChild>
            <Link href={`/orders/${encodeURIComponent(orderId)}`}>
              Back to order
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const isSucceeded = session.status === "SUCCEEDED";
  const isFailed = session.status === "FAILED";
  const isExpired = session.status === "EXPIRED";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-12">
      <section className="w-full overflow-hidden rounded-2xl border border-[#E8D8C3] bg-white shadow-sm">
        <div className="border-b border-[#E8D8C3] bg-[#F8F4ED] px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A87945]">
            Development payment gateway
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#4B3621]">
            Complete your payment
          </h1>

          <p className="mt-1 text-sm text-[#806B56]">
            This is a simulated payment page for development and testing.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-xl bg-[#F8F4ED] p-5 text-center">
            <p className="text-sm text-[#806B56]">Amount to pay</p>

            <p className="mt-2 text-3xl font-bold text-[#4B3621]">
              {formatPaymentAmount(session.amount, session.currency)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-[#806B56]">Payment status</span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isSucceeded
                  ? "bg-green-100 text-green-800"
                  : isFailed || isExpired
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {getPaymentStatusLabel(session.status)}
            </span>
          </div>

          {session.instructions && (
            <p className="rounded-lg border border-[#E8D8C3] p-3 text-xs leading-5 text-[#806B56]">
              {session.instructions}
            </p>
          )}

          {actionError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {actionError}
            </p>
          )}

          {actionMessage && (
            <p
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            >
              {actionMessage}
            </p>
          )}

          {isPending && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() => void handleSucceed()}
                disabled={isActionLoading}
                className="bg-green-700 text-white hover:bg-green-800"
              >
                {succeedState.isLoading
                  ? "Processing..."
                  : "Simulate successful payment"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleFail()}
                disabled={isActionLoading}
              >
                {failState.isLoading
                  ? "Processing..."
                  : "Simulate failed payment"}
              </Button>
            </div>
          )}

          {isSucceeded && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <h2 className="font-semibold text-green-800">
                Payment completed successfully
              </h2>
              <p className="mt-1 text-sm text-green-700">
                The backend has received the successful payment event.
              </p>
            </div>
          )}

          {isFailed && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <h2 className="font-semibold text-red-800">
                Payment was declined
              </h2>
              <p className="mt-1 text-sm text-red-700">
                The payment provider reported a declined payment.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <h2 className="font-semibold text-amber-800">
                Payment session expired
              </h2>
            </div>
          )}

          <div className="border-t border-[#E8D8C3] pt-5">
            <Button asChild variant="outline" className="w-full">
              <Link href={`/orders/${encodeURIComponent(orderId)}`}>
                View order
              </Link>
            </Button>
          </div>

          <p className="break-all text-center text-[11px] text-[#A18B75]">
            Payment reference: {providerPaymentId}
          </p>
        </div>
      </section>
    </main>
  );
}
