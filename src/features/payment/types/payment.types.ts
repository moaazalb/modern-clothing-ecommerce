/**
 * State of one payment attempt. These values mirror the backend
 * PaymentAttemptStatus enum.
 */
export type PaymentAttemptStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "EXPIRED"
  | "REFUND_PENDING"
  | "REFUNDED";

/**
 * A payment attempt returned by the payment endpoints of an order.
 * checkoutUrl is only present while the attempt is PENDING.
 */
export interface Payment {
  id: string;
  orderId: string;
  status: PaymentAttemptStatus;
  amount: string;
  currency: string;
  checkoutUrl: string | null;
  expiresAt: string;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
}