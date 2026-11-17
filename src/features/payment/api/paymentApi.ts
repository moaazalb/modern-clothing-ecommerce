import { baseApi } from "@/lib/api/baseApi";

import type { Payment } from "../types/payment.types";

/**
 * Online payment endpoints injected into the central API instance.
 *
 * Payments belong to the signed-in user's orders, so they use RTK Query.
 */
export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Opens (or resumes) the checkout session of an online order.
     * Repeating the call while an attempt is pending returns the same
     * attempt and the same checkout address.
     */
    startPayment: builder.mutation<Payment, string>({
      query: (orderId) => ({
        url: `orders/${encodeURIComponent(orderId)}/payment`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, orderId) => [
        { type: "Payment", id: orderId },
      ],
    }),

    /**
     * Retrieves the latest payment attempt of an order.
     * Answers 404 (code PAYMENT_NOT_FOUND) when no attempt exists yet.
     */
    getPayment: builder.query<Payment, string>({
      query: (orderId) => `orders/${encodeURIComponent(orderId)}/payment`,
      providesTags: (_result, _error, orderId) => [
        { type: "Payment", id: orderId },
      ],
    }),
  }),
});

export const { useStartPaymentMutation, useGetPaymentQuery } = paymentApi;