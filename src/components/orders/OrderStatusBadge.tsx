import type { ReactElement } from "react";

import { ORDER_STATUS_LABELS } from "@/features/order/types/order.types";
import type { OrderStatus } from "@/features/order/types/order.types";

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: "border-amber-300 bg-amber-50 text-amber-800",
  CONFIRMED: "border-sky-300 bg-sky-50 text-sky-800",
  SHIPPED: "border-indigo-300 bg-indigo-50 text-indigo-800",
  DELIVERED: "border-emerald-300 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-red-300 bg-red-50 text-red-800",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

/**
 * Colored label of an order status.
 *
 * @param {OrderStatusBadgeProps} props - Component props.
 * @param {OrderStatus} props.status - The order status.
 * @returns {JSX.Element} The badge.
 */
export function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps): ReactElement {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}