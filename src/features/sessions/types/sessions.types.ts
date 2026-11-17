/**
 * Represents an active user session returned by the API.
 */
export interface UserSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * Response returned when fetching the user's active sessions.
 */
export interface GetSessionsResponse {
  sessions: UserSession[];
}

/**
 * Response returned when revoking a session.
 */
export interface RevokeSessionResponse {
  message: string;
}

/**
 * Response returned when revoking all user sessions.
 */
export interface RevokeAllSessionsResponse {
  message: string;
  revokedCount: number;
}
