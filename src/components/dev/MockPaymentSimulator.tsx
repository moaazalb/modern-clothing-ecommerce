"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";

type Outcome = "succeed" | "fail";

interface MockPaymentSimulatorProps {
  providerPaymentId: string;
  orderId?: string;
}

/**
 * DEVELOPMENT ONLY. Stands in for the payment gateway page while the backend
 * uses the mock provider: it asks the backend to send the signed webhook
 * that a real gateway would send, then returns to the order page.
 *
 * Delete it (and its page) when a real gateway is configured.
 *
 * @param {MockPaymentSimulatorProps} props - Component props.
 * @param {string} props.providerPaymentId - Payment id at the mock provider.
 * @param {string} [props.orderId] - The order to return to.
 * @returns {JSX.Element} The simulator.
 */
export function MockPaymentSimulator({
  providerPaymentId,
  orderId,
}: MockPaymentSimulatorProps): ReactElement {
  const router = useRouter();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderPath = orderId ? `/orders/${orderId}` : "/orders";

  /**
   * Plays the customer's decision on the gateway page.
   *
   * @param {Outcome} outcome - "succeed" pays, "fail" simulates a declined card.
   * @returns {Promise<void>}
   */
  const handleOutcome = async (outcome: Outcome): Promise<void> => {
    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dev/mock-payments/${encodeURIComponent(providerPaymentId)}/${outcome}`,
        { method: "POST" },
      );

      if (!response.ok) {
        throw new Error(`The mock gateway answered ${response.status}.`);
      }

      router.push(orderPath);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "The request failed.",
      );
      setIsSending(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        Development only: this page simulates the payment gateway.
      </p>

      <h1 className="text-2xl font-bold text-[#4B3621]">Mock payment page</h1>

      <p className="break-all text-xs text-[#806B56]">{providerPaymentId}</p>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <Button
        type="button"
        disabled={isSending}
        onClick={() => void handleOutcome("succeed")}
        className="bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Pay (simulate success)
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={isSending}
        onClick={() => void handleOutcome("fail")}
        className="border-red-300 text-red-700 hover:bg-red-50"
      >
        Decline (simulate a failed payment)
      </Button>

      <Button
        type="button"
        variant="ghost"
        disabled={isSending}
        onClick={() => router.push(orderPath)}
      >
        Go back without paying
      </Button>
    </main>
  );
}