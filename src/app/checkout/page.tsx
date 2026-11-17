import type { Metadata } from "next";
import type { ReactElement } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Checkout } from "@/components/checkout/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
};

/**
 * Checkout page (signed-in users only).
 *
 * @returns The checkout page.
 */
export default function CheckoutPage(): ReactElement {
  return (
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  );
}