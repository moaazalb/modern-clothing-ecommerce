import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { Mutex } from 'async-mutex';

import {
  clearCredentials,
  setAccessToken,
} from '@/features/auth/store/authSlice';

import type { AuthState } from '@/features/auth/types/auth.types';

/**
 * Creates a mutex to prevent multiple simultaneous refresh requests.
 */
const mutex = new Mutex();

/**
 * Base query configuration shared by all API requests.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
  credentials: 'include',

  /**
   * Attaches the current access token to outgoing requests.
   */
  prepareHeaders: (headers, { getState }) => {
    const authState = (getState() as { auth: AuthState }).auth;

    if (authState.accessToken) {
      headers.set(
        'Authorization',
        `Bearer ${authState.accessToken}`,
      );
    }

    return headers;
  },
});

/**
 * Checks whether a request belongs to an authentication endpoint
 * that should not trigger automatic token refresh.
 *
 * @param args - Original request arguments.
 * @returns Whether the request is an authentication endpoint.
 */
function isAuthEndpoint(args: string | FetchArgs): boolean {
  const url = typeof args === 'string' ? args : args.url;

  return [
    'auth/login',
    'auth/refresh',
    'auth/logout',
  ].some((endpoint) => url.includes(endpoint));
}

/**
 * Executes API requests and automatically refreshes expired access tokens.
 *
 * A mutex ensures that only one refresh request can run at a time.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  /**
   * Waits for any ongoing refresh operation to finish.
   */
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    !isAuthEndpoint(args)
  ) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        /**
         * Requests a new access token using the HttpOnly refresh cookie.
         */
        const refreshResult = await baseQuery(
          {
            url: 'auth/refresh',
            method: 'POST',
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const { accessToken } = refreshResult.data as {
            accessToken: string;
          };

          api.dispatch(setAccessToken(accessToken));

          /**
           * Retries the original request with the new access token.
           */
          result = await baseQuery(args, api, extraOptions);
        } else {
          /**
           * Clears authentication when token refresh fails.
           */
          api.dispatch(clearCredentials());
        }
      } finally {
        release();
      }
    } else {
      /**
       * Waits for the active refresh operation instead of starting another.
       */
      await mutex.waitForUnlock();

      const authState = (
        api.getState() as { auth: AuthState }
      ).auth;

      /**
       * Retries only when another request successfully refreshed the token.
       */
      if (authState.accessToken) {
        result = await baseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};