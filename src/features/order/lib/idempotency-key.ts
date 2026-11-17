const STORAGE_KEY = "checkout-idempotency-key";

/** Same format the backend accepts: 16 to 64 letters, digits, "_" or "-". */
const KEY_REGEX = /^[A-Za-z0-9_-]{16,64}$/;

/**
 * Returns the Idempotency-Key of the current purchase attempt.
 *
 * The key is created on the first attempt and kept in sessionStorage until
 * the order is placed, so repeating the request (after a lost response or a
 * page refresh) can never create a second order.
 *
 * @returns The key to send in the Idempotency-Key header.
 */
export function getCheckoutIdempotencyKey(): string {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored && KEY_REGEX.test(stored)) {
      return stored;
    }
  } catch {
    // Storage can be blocked by the browser; a fresh key is used instead.
  }

  const key = crypto.randomUUID();

  try {
    sessionStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Not stored: only a retry after a page refresh loses its protection.
  }

  return key;
}

/**
 * Forgets the key once the order is placed, so the next purchase gets a new one.
 *
 * @returns {void}
 */
export function clearCheckoutIdempotencyKey(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}