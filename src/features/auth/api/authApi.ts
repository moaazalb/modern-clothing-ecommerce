
import { baseApi } from '@/lib/api/baseApi';

import {
  clearCredentials,
  setAccessToken,
  setCredentials,
} from '@/features/auth/store/authSlice';

import type {
  LoginResponse,
} from '@/features/auth/types/auth.types';

/**
 * Defines the credentials required to authenticate a user.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Defines the response returned by the logout endpoint.
 */
export interface LogoutResponse {
  message: string;
}

/**
 * Handles authentication-related API requests.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Authenticates the user and stores their credentials in Redux.
     */
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),

      async onQueryStarted(
        _credentials,
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: data.user,
            }),
          );
        } catch {
          // Authentication errors are handled by the calling component.
        }
      },
    }),

    /**
     * Logs out the current user and clears local authentication state.
     */
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),

      async onQueryStarted(
        _arg,
        { dispatch, queryFulfilled },
      ) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
        }
      },
    }),

    /**
     * Restores the access token using the HttpOnly refresh cookie.
     */
    refresh: builder.mutation<
      { accessToken: string },
      void
    >({
      query: () => ({
        url: 'auth/refresh',
        method: 'POST',
      }),

      async onQueryStarted(
        _arg,
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } = await queryFulfilled;

          dispatch(setAccessToken(data.accessToken));
        } catch {
          dispatch(clearCredentials());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
