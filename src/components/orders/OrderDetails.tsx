"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactElement } from "react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import {
  useCancelOrderMutation,
  useGetMyOrderQuery,
} from "@/features/order/api/orderApi";
import { ORDER_STATUS_LABELS } from "@/features/order/types/order.types";
import { getApiErrorMessage } from "@/lib/api/getApiErrorMessage";
import { formatDateTime } from "@/lib/utils/date/date";
import { formatPrice } from "@/lib/utils/price/price";
import { PaymentPanel } from "@/components/orders/PaymentPanel";

interface OrderDetailsProps {
  orderId: string;
  justPlaced: boolean;
}

/**
 * Checks whether a failed request means the order does not exist.
 * (A malformed id is answered with 400 by the API.)
 *
 * @param {unknown} error - The error returned by RTK Query.
 * @returns {boolean} True for 404 and 400.
 */
function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error.status === 404 || error.status === 400)
  );
}

/**
 * One order: items, totals, delivery details, status timeline and cancellation.
 *
 * @param {OrderDetailsProps} props - Component props.
 * @param {string} props.orderId - Order UUID from the URL.
 * @param {boolean} props.justPlaced - True right after checkout (shows a confirmation).
 * @returns {JSX.Element} The order details.
 */
export function OrderDetails({
  orderId,
  justPlaced,
}: OrderDetailsProps): ReactElement {
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyOrderQuery(orderId, { refetchOnMountOrArgChange: true });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  /**
   * Cancels the order (allowed only while it is PENDING).
   *
   * @returns {Promise<void>}
   */
  const handleCancel = async (): Promise<void> => {
    setCancelError(null);

    try {
      await cancelOrder({
        id: orderId,
        reason: reason.trim() || undefined,
      }).unwrap();

      setIsConfirmingCancel(false);
      setReason("");
    } catch (cancelFailure: unknown) {
      setCancelError(getApiErrorMessage(cancelFailure));
    }
  };

  /**
   * Reloads the order after its payment changed (paid, failed, expired...).
   *
   * @returns {void}
   */
  const handlePaymentSettled = (): void => {
    void refetch();
  };

  if (isLoading) {
    return (
      <p role="status" className="px-4 py-16 text-center text-[#806B56]">
        Loading your order...
      </p>
    );
  }

  if (isError || !order) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-16">
        <p className="text-sm text-[#806B56]">
          {isNotFound(error) ? "Order not found." : getApiErrorMessage(error)}
        </p>

        {isNotFound(error) ? (
          <Button asChild variant="outline">
            <Link href="/orders">Back to my orders</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        )}
      </div>
    );
  }

  const canCancel = order.status === "PENDING";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {justPlaced && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {order.paymentMethod === "ONLINE"
            ? order.paymentStatus === "UNPAID"
              ? "Your order is placed and your items are reserved. Complete the payment below to confirm it."
              : "Thank you! Your order has been placed."
            : "Thank you! Your order has been placed. You will pay when you receive it."}
        </p>
      )}

      <Link
        href="/orders"
        className="text-sm font-medium text-[#A87945] hover:underline"
      >
        ← My orders
      </Link>

      <header className="mt-3 mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#4B3621] sm:text-3xl">
            Order {order.orderNumber}
          </h1>

          <p className="text-sm text-[#806B56]">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </header>

      <section aria-labelledby="items-title" className="mb-8">
        <h2 id="items-title" className="mb-3 text-lg font-bold text-[#4B3621]">
          Items
        </h2>

        <ul className="divide-y divide-[#E8D8C3] rounded-xl border border-[#E8D8C3] bg-white">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold text-[#4B3621]">
                  {item.productName}
                </p>

                <p className="text-xs text-[#806B56]">
                  {item.colorName}
                  {item.sizeName ? ` / ${item.sizeName}` : ""} · SKU {item.sku}
                </p>

                <p className="text-xs text-[#806B56]">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>

              <p className="font-semibold text-[#4B3621]">
                {formatPrice(item.lineTotal)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 ms-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#806B56]">Subtotal</dt>
            <dd className="font-semibold text-[#4B3621]">
              {formatPrice(order.subtotal)}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-[#806B56]">Shipping</dt>
            <dd className="font-semibold text-[#4B3621]">
              {formatPrice(order.shippingFee)}
            </dd>
          </div>

          <div className="flex justify-between border-t border-[#E8D8C3] pt-2 text-base">
            <dt className="font-bold text-[#4B3621]">Total</dt>
            <dd className="font-bold text-[#A87945]">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <section
          aria-labelledby="delivery-title"
          className="rounded-xl border border-[#E8D8C3] bg-white p-4"
        >
          <h2
            id="delivery-title"
            className="mb-2 text-lg font-bold text-[#4B3621]"
          >
            Delivery
          </h2>

          <address className="text-sm not-italic leading-6 text-[#4B3621]">
            {order.shipping.name}
            <br />
            {order.shipping.address}
            <br />
            {order.shipping.city}, {order.shipping.country}
            <br />
            {order.shipping.phone}
          </address>

          {order.shipping.notes && (
            <p className="mt-2 text-xs text-[#806B56]">
              Notes: {order.shipping.notes}
            </p>
          )}
        </section>

        <section
          aria-labelledby="payment-title"
          className="rounded-xl border border-[#E8D8C3] bg-white p-4"
        >
          <h2
            id="payment-title"
            className="mb-2 text-lg font-bold text-[#4B3621]"
          >
            Payment
          </h2>

          {order.paymentMethod === "ONLINE" ? (
            <PaymentPanel order={order} onSettled={handlePaymentSettled} />
          ) : (
            <>
              <p className="text-sm text-[#4B3621]">Cash on delivery</p>

              <p className="text-xs text-[#806B56]">
                {order.paymentStatus === "PAID"
                  ? "Paid"
                  : "To be paid when you receive your order."}
              </p>
            </>
          )}

          {order.customerNote && (
            <p className="mt-2 text-xs text-[#806B56]">
              Your note: {order.customerNote}
            </p>
          )}
        </section>
      </div>

      <section aria-labelledby="timeline-title" className="mb-8">
        <h2
          id="timeline-title"
          className="mb-3 text-lg font-bold text-[#4B3621]"
        >
          Status
        </h2>

        <ol className="space-y-2 border-s-2 border-[#E8D8C3] ps-4">
          {order.statusHistory.map((entry) => (
            <li key={`${entry.status}-${entry.createdAt}`} className="text-sm">
              <span className="font-semibold text-[#4B3621]">
                {ORDER_STATUS_LABELS[entry.status]}
              </span>

              <span className="ms-2 text-xs text-[#806B56]">
                {formatDateTime(entry.createdAt)}
              </span>
            </li>
          ))}
        </ol>

        {order.status === "CANCELLED" && order.cancelReason && (
          <p className="mt-3 text-sm text-[#806B56]">
            Reason: {order.cancelReason}
          </p>
        )}
      </section>

      {canCancel && (
        <section aria-label="Cancel order">
          {isConfirmingCancel ? (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Cancel this order? The items will go back to stock.
              </p>

              <label
                htmlFor="cancel-reason"
                className="block text-xs font-medium text-red-800"
              >
                Reason (optional)
              </label>

              <input
                id="cancel-reason"
                type="text"
                value={reason}
                maxLength={300}
                onChange={(event) => setReason(event.target.value)}
                className="h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-sm text-[#4B3621] outline-none focus:ring-2 focus:ring-red-200"
              />

              {cancelError && (
                <p role="alert" className="text-sm text-red-700">
                  {cancelError}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => void handleCancel()}
                  disabled={isCancelling}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isCancelling ? "Cancelling..." : "Yes, cancel order"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmingCancel(false)}
                  disabled={isCancelling}
                >
                  Keep order
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmingCancel(true)}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Cancel order
            </Button>
          )}
        </section>
      )}
    </main>
  );
}
