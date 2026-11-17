/**
 * Error thrown when the API answers a server-side request with an error status.
 */
export class ServerApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ServerApiError";
    this.status = status;
  }
}

interface ServerFetchOptions {
  /** Query parameters. Empty values are left out of the URL. */
  params?: object;
  /** Seconds the response can be served from the Next.js cache. */
  revalidate?: number;
}

const DEFAULT_REVALIDATE_SECONDS = 60;

/**
 * Fetches public data from the backend on the server (Server Components).
 *
 * Only for public endpoints: the access token lives in the browser, so
 * anything that needs authentication must use RTK Query instead.
 *
 * @param path - API path without a leading slash (e.g. "products").
 * @param options - Query parameters and cache lifetime.
 * @returns The parsed JSON response.
 * @throws ServerApiError If the API answers with an error status.
 */
export async function serverFetch<T>(
  path: string,
  { params, revalidate = DEFAULT_REVALIDATE_SECONDS }: ServerFetchOptions = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set.");
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    const isValid =
      typeof value === "string"
        ? value !== ""
        : typeof value === "number" || typeof value === "boolean";

    if (isValid) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  const url = `${baseUrl}/${path}${query ? `?${query}` : ""}`;

  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) {
    throw new ServerApiError(
      response.status,
      `API request failed (${response.status}): ${path}`,
    );
  }

  return (await response.json()) as T;
}