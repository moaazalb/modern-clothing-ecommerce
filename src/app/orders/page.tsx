import type { Metadata } from "next";
import type { ReactElement } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrdersList } from "@/components/orders/OrdersList";
import { ORDER_STATUSES } from "@/features/order/types/order.types";
import type { OrderStatus } from "@/features/order/types/order.types";

export const metadata: Metadata = {
  title: "My Orders",
};

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Returns the first value of a search parameter.
 *
 * @param value - A string or a list of strings.
 * @returns The first string, or undefined.
 */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The signed-in user's orders. The status filter and the page come from the URL.
 *
 * @param props - Page props.
 * @returns The orders page.
 */
export default async function OrdersPage({
  searchParams,
}: OrdersPageProps): Promise<ReactElement> {
  const raw = await searchParams;

  const statusParam = first(raw.status);
  const status = ORDER_STATUSES.find(
    (value): value is OrderStatus => value === statusParam,
  );

  const parsedPage = Number.parseInt(first(raw.page) ?? "", 10);
  const page =
    Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= 10_000
      ? parsedPage
      : 1;

  return (
    <ProtectedRoute>
      <OrdersList page={page} status={status} />
    </ProtectedRoute>
  );
}