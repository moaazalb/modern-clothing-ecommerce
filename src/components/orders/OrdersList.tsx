"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { useGetMyOrdersQuery } from "@/features/order/api/orderApi";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/features/order/types/order.types";
import type { OrderStatus } from "@/features/order/types/order.types";
import { getApiErrorMessage } from "@/lib/api/getApiErrorMessage";
import { formatDateTime } from "@/lib/utils/date/date";
import { formatPrice } from "@/lib/utils/price/price";

const ORDERS_PER_PAGE = 10;

interface OrdersListProps {
  page: number;
  status?: OrderStatus;
}

/**
 * Builds a link to the orders list that keeps the filter.
 *
 * @param {OrderStatus | undefined} status - Status filter.
 * @param {number} page - Page number.
 * @returns {string} The URL.
 */
function buildHref(status: OrderStatus | undefined, page: number): string {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `/orders?${query}` : "/orders";
}

/**
 * The signed-in user's orders with a status filter and pagination.
 * The filter and the page live in the URL.
 *
 * @param {OrdersListProps} props - Component props.
 * @param {number} props.page - Current page.
 * @param {OrderStatus} [props.status] - Active status filter.
 * @returns {JSX.Element} The orders list.
 */
export function OrdersList({ page, status }: OrdersListProps): ReactElement {
  const { data, isLoading, isError, error, refetch } = useGetMyOrdersQuery(
    { page, limit: ORDERS_PER_PAGE, status },
    { refetchOnMountOrArgChange: true },
  );

  const tabs: { label: string; value: OrderStatus | undefined }[] = [
    { label: "All", value: undefined },
    ...ORDER_STATUSES.map((value) => ({
      label: ORDER_STATUS_LABELS[value],
      value,
    })),
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-[#4B3621]">
        My Orders
      </h1>

      <nav aria-label="Filter orders by status" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.value === status;

          return (
            <Link
              key={tab.label}
              href={buildHref(tab.value, 1)}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[#A87945] bg-[#A87945] text-white"
                  : "border-[#D6B58A] bg-[#F8F4ED] text-[#4B3621] hover:bg-[#E8D8C3]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {isLoading ? (
        <p role="status" className="py-12 text-center text-[#806B56]">
          Loading your orders...
        </p>
      ) : isError || !data ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-12">
          <p className="text-sm text-red-700">{getApiErrorMessage(error)}</p>

          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <p role="status" className="py-12 text-center text-[#806B56]">
          {status ? "No orders with this status." : "You have no orders yet."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8D8C3] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-[#4B3621]">
                      {order.orderNumber}
                    </p>

                    <p className="text-xs text-[#806B56]">
                      {formatDateTime(order.createdAt)} · {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />

                    <span className="font-bold text-[#A87945]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {data.meta.totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-center gap-4"
            >
              {data.meta.page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={buildHref(status, data.meta.page - 1)}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Previous
                </Button>
              )}

              <span className="text-sm font-medium text-[#4B3621]">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>

              {data.meta.page < data.meta.totalPages ? (
                <Button asChild variant="outline">
                  <Link href={buildHref(status, data.meta.page + 1)}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Next
                </Button>
              )}
            </nav>
          )}
        </>
      )}
    </main>
  );
}