const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Display only: the API sends money as strings, never calculate with the result. */
export function formatPrice(value: string): string {
  return usd.format(Number(value));
}