import { baseApi } from "@/lib/api/baseApi";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  CreateOrderPayload,
  OrderDetail,
  OrderListQueryParams,
  OrderSummary,
} from "../types/order.types";

/**
 * Order endpoints injected into the central API instance.
 *
 * Orders are private data of the signed-in user, so they use RTK Query.
 */
export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Places an order from the cart. The Idempotency-Key makes a retry
     * return the same order instead of creating another one.
     * The server empties the cart, so the cart cache is refreshed.
     */
    createOrder: builder.mutation<
      OrderDetail,
      { body: CreateOrderPayload; idempotencyKey: string }
    >({
      query: ({ body, idempotencyKey }) => ({
        url: "orders",
        method: "POST",
        body,
        headers: { "Idempotency-Key": idempotencyKey },
      }),
      invalidatesTags: ["Cart", { type: "Order", id: "LIST" }],
    }),

    /**
     * Lists the signed-in user's orders, newest first.
     */
    getMyOrders: builder.query<
      PaginatedResponse<OrderSummary>,
      OrderListQueryParams | void
    >({
      query: (params) => ({
        url: "orders",
        params: params ?? undefined,
      }),
      providesTags: (result) => [
        ...(result?.items ?? []).map(({ id }) => ({
          type: "Order" as const,
          id,
        })),
        { type: "Order" as const, id: "LIST" },
      ],
    }),

    /**
     * Retrieves one of the signed-in user's orders.
     */
    getMyOrder: builder.query<OrderDetail, string>({
      query: (id) => `orders/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    /**
     * Cancels an order while it is PENDING (the stock is put back).
     */
    cancelOrder: builder.mutation<OrderDetail, { id: string; reason?: string }>(
      {
        query: ({ id, reason }) => ({
          url: `orders/${encodeURIComponent(id)}/cancel`,
          method: "POST",
          body: { reason },
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Order", id },
          { type: "Order", id: "LIST" },
        ],
      },
    ),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useCancelOrderMutation,
} = orderApi;