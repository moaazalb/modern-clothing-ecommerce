import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthState, AuthUser } from "../types/auth.types";

/**
 * Initial authentication state.
 *
 * Access tokens are intentionally kept in memory only.
 */
const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: "unknown",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Stores authentication credentials after a successful login.
     *
     * @param state - Current authentication state.
     * @param action - Access token and authenticated user.
     */
    setCredentials(
      state,
      action: PayloadAction<{
        accessToken: string;
        user: AuthUser;
      }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = "authenticated";
    },

    /**
     * Updates the access token after successful token refresh.
     *
     * @param state - Current authentication state.
     * @param action - Newly generated access token.
     */
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },

    /**
     * Clears the current authentication state.
     *
     * @param state - Current authentication state.
     */
    clearCredentials(state) {
      state.accessToken = null;
      state.user = null;
      state.status = "unauthenticated";
    },

    /**
     * Stores the authenticated user's profile.
     */
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.status = "authenticated";
    },
  },
});

export const { setCredentials, setAccessToken, clearCredentials, setUser } =
  authSlice.actions;

export default authSlice.reducer;
