
import type { Metadata } from "next";
import type { ReactElement } from "react";

import { MockPaymentPageClient } from "@/components/payment/MockPaymentPageClient";

interface MockPaymentPageProps {
  params: Promise<{
    providerPaymentId: string;
  }>;
  searchParams: Promise<{
    order?: string;
  }>;
}

/**
 * Metadata for the development mock-payment page.
 */
export const metadata: Metadata = {
  title: "Mock Payment",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Development mock-payment route.
 *
 * @param props - Route parameters and query parameters.
 * @returns Mock payment page.
 */
export default async function MockPaymentPage({
  params,
  searchParams,
}: MockPaymentPageProps): Promise<ReactElement> {
  const [{ providerPaymentId }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!query.order) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4">
        <p role="alert" className="text-center text-sm text-red-700">
          Missing order reference in the payment URL.
        </p>
      </main>
    );
  }

  return (
    <MockPaymentPageClient
      providerPaymentId={providerPaymentId}
      orderId={query.order}
    />
  );
}
