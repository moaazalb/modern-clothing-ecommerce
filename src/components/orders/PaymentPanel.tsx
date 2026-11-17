"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import type { OrderDetail } from "@/features/order/types/order.types";
import {
  useGetPaymentQuery,
  useStartPaymentMutation,
} from "@/features/payment/api/paymentApi";
import { getCheckoutDestination } from "@/features/payment/lib/checkout-redirect";
import type {
  Payment,
  PaymentAttemptStatus,
} from "@/features/payment/types/payment.types";
import {
  getApiErrorCode,
  getApiErrorMessage,
} from "@/lib/api/getApiErrorMessage";
import { formatDateTime } from "@/lib/utils/date/date";
import { formatPrice } from "@/lib/utils/price/price";

/** How often the payment is checked while the customer may have just paid. */
const POLL_INTERVAL_MS = 3000;

/** The automatic check stops after this time (the button still works). */
const POLL_DURATION_MS = 60_000;

/** Errors that mean the order changed: the order must be reloaded. */
const ORDER_CHANGED_CODES: readonly string[] = [
  "ORDER_NOT_PAYABLE",
  "PAYMENT_WINDOW_EXPIRED",
];

type Tone = "info" | "success" | "warning" | "error";

interface PaymentSummary {
  tone: Tone;
  headline: string;
  detail?: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  info: "border-[#E8D8C3] bg-[#F8F4ED] text-[#4B3621]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

interface PaymentPanelProps {
  order: OrderDetail;
  onSettled: () => void;
}

/**
 * Explains why a payment attempt failed, in words the customer understands.
 *
 * @param {string | null} reason - Failure reason stored by the backend.
 * @returns {string} A short sentence.
 */
function describeFailure(reason: string | null): string {
  if (reason === "card_declined") return "Your card was declined.";
  if (reason === "PROVIDER_ERROR") return "The payment service was unavailable.";

  return "The payment did not go through.";
}

/**
 * Builds the message shown for the payment of an order.
 *
 * @param {OrderDetail} order - The order (its payment status is the source of truth).
 * @param {Payment | undefined} payment - The latest payment attempt, if any.
 * @returns {PaymentSummary} The tone, headline and detail to show.
 */
function describePayment(
  order: OrderDetail,
  payment: Payment | undefined,
): PaymentSummary {
  if (order.paymentStatus === "PAID") {
    return {
      tone: "success",
      headline: "Paid online",
      detail: payment?.paidAt
        ? `Received on ${formatDateTime(payment.paidAt)}.`
        : undefined,
    };
  }

  if (order.paymentStatus === "REFUND_PENDING") {
    return {
      tone: "warning",
      headline: "Refund in progress",
      detail: "Your payment is being returned to you. This can take a while.",
    };
  }

  if (order.paymentStatus === "REFUNDED") {
    return {
      tone: "info",
      headline: "Refunded",
      detail: "Your payment was returned to you.",
    };
  }

  if (order.status === "CANCELLED") {
    return {
      tone: "info",
      headline: "Not paid",
      detail: "This order was cancelled before it was paid.",
    };
  }

  switch (payment?.status) {
    case "PENDING":
      return {
        tone: "info",
        headline: "Waiting for your payment",
        detail: `Complete the payment before ${formatDateTime(payment.expiresAt)}.`,
      };
    case "FAILED":
      return {
        tone: "error",
        headline: "Payment failed",
        detail: describeFailure(payment.failureReason),
      };
    case "EXPIRED":
      return {
        tone: "error",
        headline: "Payment time expired",
        detail:
          "The time to pay has passed. The order will be cancelled automatically.",
      };
    case "SUCCEEDED":
    case "REFUND_PENDING":
    case "REFUNDED":
      return { tone: "info", headline: "Confirming your payment..." };
    default:
      return {
        tone: "warning",
        headline: "Payment required",
        detail:
          "Pay online to confirm your order. Your items are reserved for a limited time.",
      };
  }
}

/**
 * Online payment section of an order: its status, and the button that
 * sends the customer to the payment page.
 *
 * After the customer comes back from the gateway the money is confirmed by
 * a webhook that can take a few seconds, so the payment is checked every
 * few seconds for one minute while it is pending. When it leaves PENDING,
 * onSettled reloads the order.
 *
 * @param {PaymentPanelProps} props - Component props.
 * @param {OrderDetail} props.order - An order paid online.
 * @param {() => void} props.onSettled - Called when the order must be reloaded.
 * @returns {JSX.Element} The payment section.
 */
export function PaymentPanel({
  order,
  onSettled,
}: PaymentPanelProps): ReactElement {
  const { data: payment, isLoading, isFetching, error, refetch } =
    useGetPaymentQuery(order.id, { refetchOnMountOrArgChange: true });
  const [startPayment, { isLoading: isStarting }] = useStartPaymentMutation();

  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [isPollingOver, setIsPollingOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previousStatus = useRef<PaymentAttemptStatus | undefined>(undefined);

  const paymentStatus = payment?.status;
  const hasNoAttempt = getApiErrorCode(error) === "PAYMENT_NOT_FOUND";
  const queryFailed = error !== undefined && !hasNoAttempt;

  // Stop the automatic checks after one minute.
  useEffect(() => {
    const timer = setTimeout(() => setIsPollingOver(true), POLL_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  // Check the payment while it is pending.
  useEffect(() => {
    if (paymentStatus !== "PENDING" || isPollingOver) {
      return undefined;
    }

    const interval = setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [paymentStatus, isPollingOver, refetch]);

  // When a pending payment is settled, the order changed too: reload it.
  useEffect(() => {
    if (
      previousStatus.current === "PENDING" &&
      paymentStatus !== undefined &&
      paymentStatus !== "PENDING"
    ) {
      onSettled();
    }

    previousStatus.current = paymentStatus;
  }, [paymentStatus, onSettled]);

  const isAwaitingPayment =
    order.status === "PENDING" && order.paymentStatus === "UNPAID";

  const canPay =
    isAwaitingPayment &&
    !isLoading &&
    !queryFailed &&
    (payment === undefined ||
      payment.status === "PENDING" ||
      payment.status === "FAILED");

  let payLabel = `Pay now · ${formatPrice(order.total)}`;

  if (payment?.status === "PENDING") payLabel = "Continue to payment";
  if (payment?.status === "FAILED") payLabel = "Try again";

  /**
   * Opens the payment page. Repeating it while an attempt is pending
   * returns the same attempt, so a double click is harmless.
   *
   * @returns {Promise<void>}
   */
  const handlePay = async (): Promise<void> => {
    setErrorMessage(null);

    try {
      const attempt = await startPayment(order.id).unwrap();
      const destination = attempt.checkoutUrl
        ? getCheckoutDestination(attempt.checkoutUrl, order.id)
        : null;

      if (!destination) {
        setErrorMessage("The payment page is not available. Please try again.");
        return;
      }

      setIsRedirecting(true);
      window.location.assign(destination);
    } catch (payError: unknown) {
      setErrorMessage(getApiErrorMessage(payError));

      const code = getApiErrorCode(payError);

      if (code && ORDER_CHANGED_CODES.includes(code)) {
        onSettled();
      }
    }
  };

  const summary = describePayment(order, payment);
  const isBusy = isStarting || isRedirecting;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#4B3621]">
        Online payment · {formatPrice(order.total)}
      </p>

      {isLoading ? (
        <p role="status" className="text-xs text-[#806B56]">
          Checking your payment...
        </p>
      ) : queryFailed ? (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="text-sm text-red-700">{getApiErrorMessage(error)}</p>

          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm ${TONE_CLASSES[summary.tone]}`}
        >
          <p className="font-semibold">{summary.headline}</p>

          {summary.detail && <p className="mt-1 text-xs">{summary.detail}</p>}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {canPay && (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => void handlePay()}
            disabled={isBusy}
            className="bg-[#A87945] text-white hover:bg-[#4B3621]"
          >
            {isRedirecting
              ? "Redirecting..."
              : isStarting
                ? "Opening payment..."
                : payLabel}
          </Button>

          {payment?.status === "PENDING" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching || isBusy}
            >
              {isFetching ? "Checking..." : "Check payment status"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}