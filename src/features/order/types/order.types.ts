import type { CartItemIssue } from "@/features/cart/types/cart.types";
/**
 * Order statuses. These values mirror the backend OrderStatus enum.
 */
export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export type PaymentMethod = "COD" | "ONLINE";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUND_PENDING" | "REFUNDED";

/**
 * A line of an order: a frozen snapshot of what was bought.
 */
export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  colorName: string;
  sizeName: string | null;
  sizeCode: string | null;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

/**
 * Delivery details of an order.
 */
export interface OrderShipping {
  name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  notes: string | null;
}

/**
 * A status change shown on the order timeline.
 */
export interface OrderStatusEntry {
  status: OrderStatus;
  createdAt: string;
}

/**
 * An order in the list returned by GET /orders.
 */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: string;
  currency: string;
  itemCount: number;
  createdAt: string;
}

/**
 * Order details returned by GET /orders/:id and POST /orders.
 */
export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: string;
  shippingFee: string;
  total: string;
  shipping: OrderShipping;
  customerNote: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusEntry[];
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query parameters supported by GET /orders.
 */
export interface OrderListQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

/**
 * Delivery details sent when placing an order. The items and the prices
 * always come from the cart on the server.
 */
export interface CreateOrderPayload {
  shippingName: string;
  shippingPhone: string;
  shippingCountry: string;
  shippingCity: string;
  shippingAddress: string;
  shippingNotes?: string;
  customerNote?: string;
  paymentMethod?: PaymentMethod;
}


/**
 * A cart line that could not be ordered (body of the 409 checkout error).
 */
export interface CheckoutUnavailableItem {
  variantId: string;
  productName: string | null;
  sku: string | null;
  issue: CartItemIssue;
  available: number;
}