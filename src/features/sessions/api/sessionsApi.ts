import { baseApi } from "@/lib/api/baseApi";

import type {
  GetSessionsResponse,
  RevokeAllSessionsResponse,
  RevokeSessionResponse,
} from "@/features/sessions/types/sessions.types";

export const sessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches all active sessions belonging to the authenticated user.
     */
    getSessions: builder.query<GetSessionsResponse, void>({
      query: () => ({
        url: "sessions",
        method: "GET",
      }),
      providesTags: ["Session"],
    }),

    /**
     * Revokes a specific session belonging to the authenticated user.
     */
    revokeSession: builder.mutation<RevokeSessionResponse, string>({
      query: (sessionId) => ({
        url: `sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Session"],
    }),

    /**
     * Revokes all active sessions belonging to the authenticated user.
     */
    revokeAllSessions: builder.mutation<RevokeAllSessionsResponse, void>({
      query: () => ({
        url: "sessions",
        method: "DELETE",
      }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
} = sessionsApi;
