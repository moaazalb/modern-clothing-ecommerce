/** Path of the development-only mock gateway on the backend. */
const MOCK_GATEWAY_PATH_PREFIX = "/dev/mock-payments/";

/**
 * Decides where to send the customer to pay.
 *
 * Only http(s) addresses are accepted. In development, the mock provider's
 * address points to a JSON endpoint of the backend, so the customer is sent
 * to the local simulator page instead. A real gateway address is used as is.
 *
 * @param checkoutUrl - The address returned by the payment endpoint.
 * @param orderId - The order being paid (the simulator needs it to come back).
 * @returns The address to navigate to, or null when checkoutUrl is not usable.
 */
export function getCheckoutDestination(
  checkoutUrl: string,
  orderId: string,
): string | null {
  let url: URL;

  try {
    url = new URL(checkoutUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    url.pathname.startsWith(MOCK_GATEWAY_PATH_PREFIX)
  ) {
    const providerPaymentId = url.pathname.slice(MOCK_GATEWAY_PATH_PREFIX.length);

    return `/dev/mock-payment/${encodeURIComponent(providerPaymentId)}?order=${encodeURIComponent(orderId)}`;
  }

  return url.toString();
}