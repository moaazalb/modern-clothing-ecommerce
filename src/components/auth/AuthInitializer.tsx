
'use client';

import { useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { authApi } from '@/features/auth/api/authApi';
import { usersApi } from '@/features/users/api/usersApi';

import {
  clearCredentials,
  setUser,
} from '@/features/auth/store/authSlice';

import { useAppDispatch } from '@/store/hooks';

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * Restores the user's authentication session when the application starts.
 *
 * The refresh cookie is used to obtain a new access token,
 * then the current user's profile is retrieved.
 */
export function AuthInitializer({
  children,
}: AuthInitializerProps): ReactElement {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    /**
     * Prevents duplicate initialization in React Strict Mode.
     */
    if (initialized.current) return;

    initialized.current = true;

    async function restoreSession(): Promise<void> {
      try {
        /**
         * Obtains a new access token using the HttpOnly refresh cookie.
         */
        await dispatch(
          authApi.endpoints.refresh.initiate(),
        ).unwrap();

        /**
         * Retrieves the authenticated user's profile.
         */
        const user = await dispatch(
          usersApi.endpoints.getMe.initiate(undefined, {
            subscribe: false,
            forceRefetch: true,
          }),
        ).unwrap();

        dispatch(setUser(user));
      } catch {
        /**
         * Clears authentication when session restoration fails.
         */
        dispatch(clearCredentials());
      }
    }

    void restoreSession();
  }, [dispatch]);

  return <>{children}</>;
}
