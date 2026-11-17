"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactElement } from "react";

import { CartItemRow } from "@/components/cart/CartItemRow";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
} from "@/features/cart/api/cartApi";
import { getApiErrorMessage } from "@/lib/api/getApiErrorMessage";
import { formatPrice } from "@/lib/utils/price/price";

/**
 * Checkout page content: the delivery form and the bag summary.
 *
 * The bag and its subtotal come from the server (GET /cart). The shipping
 * fee is added by the server when the order is placed, so the final total
 * is shown on the order page.
 *
 * @returns {JSX.Element} The checkout.
 */
export function Checkout(): ReactElement {
  const router = useRouter();
  const [redirectLabel, setRedirectLabel] = useState<string | null>(null);

  const {
    data: cart,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCartQuery(undefined, { refetchOnMountOrArgChange: true });

  const [removeCartItem, { isLoading: isRemoving, isError: removeFailed }] =
    useRemoveCartItemMutation();

  /**
   * Removes a line of the bag (the cart refreshes by itself).
   *
   * @param {string} itemId - Cart line ID.
   * @returns {Promise<void>}
   */
  const handleRemove = async (itemId: string): Promise<void> => {
    try {
      await removeCartItem(itemId).unwrap();
    } catch {
      // The failure is shown through removeFailed.
    }
  };

  /**
   * Leaves the page after the order is placed: to the payment page for an
   * online order, or to the order page. The label keeps the page from
   * flashing "bag is empty" while the emptied cart reloads.
   *
   * @param {string} orderId - The new order ID.
   * @param {string} [paymentUrl] - Address of the payment page (online orders).
   * @returns {void}
   */
  const handleOrderPlaced = (orderId: string, paymentUrl?: string): void => {
    setRedirectLabel(
      paymentUrl
        ? "Order placed. Redirecting to the payment page..."
        : "Order placed. Opening your order...",
    );

    if (paymentUrl) {
      window.location.assign(paymentUrl);
      return;
    }

    router.replace(`/orders/${orderId}?placed=1`);
  };

  if (redirectLabel) {
    return (
      <p role="status" className="px-4 py-16 text-center text-[#4B3621]">
        {redirectLabel}
      </p>
    );
  }

  if (isLoading) {
    return (
      <p role="status" className="px-4 py-16 text-center text-[#806B56]">
        Loading your checkout...
      </p>
    );
  }

  if (isError || !cart) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-16">
        <p className="text-sm text-red-700">{getApiErrorMessage(error)}</p>

        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#4B3621]">Your bag is empty</h1>

        <p className="text-sm text-[#806B56]">
          Add something to your bag before checking out.
        </p>

        <Button asChild className="bg-[#A87945] text-white hover:bg-[#4B3621]">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#4B3621]">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CheckoutForm
          canCheckout={!cart.hasUnavailableItems}
          onPlaced={handleOrderPlaced}
        />

        <aside
          aria-labelledby="order-summary-title"
          className="h-fit rounded-2xl border border-[#E8D8C3] bg-[#F8F4ED] p-5"
        >
          <h2
            id="order-summary-title"
            className="mb-3 text-lg font-bold text-[#4B3621]"
          >
            Order summary
          </h2>

          {cart.hasUnavailableItems && (
            <p
              role="alert"
              className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800"
            >
              Some items cannot be ordered. Remove them to continue.
            </p>
          )}

          {removeFailed && (
            <p role="alert" className="mb-3 text-sm text-red-700">
              Unable to remove the item. Please try again.
            </p>
          )}

          <TooltipProvider>
            <ul className="flex flex-col divide-y divide-[#E8D8C3]">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  currency={cart.currency}
                  onRemove={handleRemove}
                  isRemoving={isRemoving}
                />
              ))}
            </ul>
          </TooltipProvider>

          <dl className="mt-4 space-y-2 border-t border-[#E8D8C3] pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#806B56]">Subtotal</dt>
              <dd className="font-semibold text-[#4B3621]">
                {formatPrice(cart.subtotal)}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-[#806B56]">Shipping</dt>
              <dd className="text-[#806B56]">Added when you order</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs leading-5 text-[#806B56]">
            The final total, including shipping, is shown on your order page
            right after you place it.
          </p>
        </aside>
      </div>
    </main>
  );
}
