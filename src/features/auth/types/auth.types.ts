/**
 * Represents the authenticated user returned by the backend.
 */
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response returned after a successful login.
 */
export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

/**
 * Response returned after a successful token refresh.
 */
export interface RefreshResponse {
  accessToken: string;
}

/**
 * Represents the authentication state stored in Redux.
 */
export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  status: 'unknown' | 'authenticated' | 'unauthenticated';
}