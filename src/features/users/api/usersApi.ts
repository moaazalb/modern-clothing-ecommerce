
import { baseApi } from '@/lib/api/baseApi';

import type { AuthUser } from '@/features/auth/types/auth.types';
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from '@/features/users/types/users.types';

/**
 * Handles user-related API requests.
 */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Creates a new user account.
     */
    createUser: builder.mutation<AuthUser, CreateUserPayload>({
      query: (body) => ({
        url: 'users',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Retrieves the currently authenticated user's profile.
     */
    getMe: builder.query<AuthUser, void>({
      query: () => ({
        url: 'users/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    /**
     * Updates an existing user account.
     */
    updateUser: builder.mutation<AuthUser, UpdateUserPayload>({
      query: ({ id, ...body }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetMeQuery,
  useUpdateUserMutation,
} = usersApi;
