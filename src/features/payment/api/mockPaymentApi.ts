
import { baseApi } from "@/lib/api/baseApi";

import type { PaymentAttemptStatus } from "../types/payment.types";

/**
 * Mock payment session returned by the development gateway.
 */
export interface MockPaymentSession {
  amount: string;
  currency: string;
  status: PaymentAttemptStatus;
  instructions: string;
}

/**
 * Result returned after delivering a mock payment event.
 */
export interface MockPaymentEventResult {
  delivered: boolean;
  eventId: string;
}

/**
 * Arguments required to simulate a mock payment event.
 */
export interface MockPaymentActionArgs {
  providerPaymentId: string;
  orderId: string;
}

/**
 * Development-only mock payment API endpoints.
 *
 * These endpoints communicate with the backend MockPaymentsController.
 * They are kept separate from the real payment API.
 */
export const mockPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Retrieves a mock payment session.
     */
    getMockPayment: builder.query<MockPaymentSession, string>({
      query: (providerPaymentId) =>
        `dev/mock-payments/${encodeURIComponent(providerPaymentId)}`,
      providesTags: (_result, _error, providerPaymentId) => [
        { type: "Payment", id: `MOCK_${providerPaymentId}` },
      ],
    }),

    /**
     * Simulates a successful payment through the backend webhook flow.
     */
    succeedMockPayment: builder.mutation<
      MockPaymentEventResult,
      MockPaymentActionArgs
    >({
      query: ({ providerPaymentId }) => ({
        url: `dev/mock-payments/${encodeURIComponent(providerPaymentId)}/succeed`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "Payment", id: `MOCK_${args.providerPaymentId}` },
        { type: "Payment", id: args.orderId },
      ],
    }),

    /**
     * Simulates a failed payment through the backend webhook flow.
     */
    failMockPayment: builder.mutation<
      MockPaymentEventResult,
      MockPaymentActionArgs
    >({
      query: ({ providerPaymentId }) => ({
        url: `dev/mock-payments/${encodeURIComponent(providerPaymentId)}/fail`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "Payment", id: `MOCK_${args.providerPaymentId}` },
        { type: "Payment", id: args.orderId },
      ],
    }),
  }),
});

export const {
  useGetMockPaymentQuery,
  useSucceedMockPaymentMutation,
  useFailMockPaymentMutation,
} = mockPaymentApi;
