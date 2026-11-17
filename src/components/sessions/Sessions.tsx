"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";

import { clearCredentials } from "@/features/auth/store/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  useGetSessionsQuery,
  useRevokeAllSessionsMutation,
  useRevokeSessionMutation,
} from "@/features/sessions/api/sessionsApi";

import type { UserSession } from "@/features/sessions/types/sessions.types";

/**
 * Extracts a readable error message from an RTK Query error.
 *
 * @param error - The error returned by RTK Query.
 * @returns A readable error message.
 */
function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;

    if (typeof data === "object" && data !== null && "message" in data) {
      const message = data.message;

      if (typeof message === "string") {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(", ");
      }
    }
  }

  return "Something went wrong. Please try again.";
}

/**
 * Formats a session date using the browser's local timezone.
 *
 * @param date - The date returned by the API.
 * @returns A formatted date string.
 */
function formatSessionDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return parsedDate.toLocaleString();
}

/**
 * Displays and manages the authenticated user's active sessions.
 *
 * @returns {ReactElement} The sessions management page.
 */
export default function SessionsPage(): ReactElement {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector((state) => state.auth.status);

  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetSessionsQuery(
    undefined,
    {
      skip: authStatus !== "authenticated",
    },
  );

  const [revokeSession, { isLoading: isRevokingSession }] =
    useRevokeSessionMutation();

  const [revokeAllSessions, { isLoading: isRevokingAll }] =
    useRevokeAllSessionsMutation();

  const sessions = data?.sessions ?? [];

  /**
   * Clears local authentication and cached API data.
   *
   * @returns {void}
   */
  const handleLocalLogout = (): void => {
    dispatch(clearCredentials());
    dispatch(baseApi.util.resetApiState());
    router.replace("/login");
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  /**
   * Revokes a selected session.
   *
   * @param session - The session to revoke.
   * @returns {Promise<void>}
   */
  const handleRevokeSession = async (session: UserSession): Promise<void> => {
    const confirmed = window.confirm(
      session.isCurrent
        ? "This is your current session. You will be logged out. Continue?"
        : "Are you sure you want to end this session?",
    );

    if (!confirmed) return;

    setActionError(null);

    try {
      await revokeSession(session.id).unwrap();

      if (session.isCurrent) {
        handleLocalLogout();
      }
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  /**
   * Revokes all active sessions, including the current session.
   *
   * @returns {Promise<void>}
   */
  const handleRevokeAllSessions = async (): Promise<void> => {
    const confirmed = window.confirm(
      "This will end all active sessions, including your current session. Continue?",
    );

    if (!confirmed) return;

    setActionError(null);

    try {
      await revokeAllSessions().unwrap();
      handleLocalLogout();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  if (authStatus === "unknown" || authStatus === "unauthenticated") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Account Security
          </p>

          <h1 className="font-serif text-3xl font-semibold text-slate-800 sm:text-4xl">
            Active Sessions
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage the devices and browsers currently signed in to your account.
            End any session you no longer recognize or use.
          </p>
        </div>

        {/* Sessions Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Your devices
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {sessions.length} active{" "}
              {sessions.length === 1 ? "session" : "sessions"}
            </p>
          </div>

          {sessions.length > 0 && (
            <button
              type="button"
              onClick={handleRevokeAllSessions}
              disabled={isRevokingAll || isRevokingSession}
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRevokingAll ? "Ending sessions..." : "End all sessions"}
            </button>
          )}
        </div>

        {/* Action Error */}
        {actionError && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">Loading your sessions...</p>
          </div>
        )}

        {/* Fetch Error */}
        {isError && !isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">
              Failed to load your sessions.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-sm font-semibold text-slate-700 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && sessions.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h3 className="font-serif text-xl font-semibold text-slate-800">
              No active sessions
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no active sessions associated with your
              account.
            </p>
          </div>
        )}

        {/* Sessions List */}
        {!isLoading && !isError && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-800">
                        {session.userAgent || "Unknown device"}
                      </h3>

                      {session.isCurrent && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Current session
                        </span>
                      )}
                    </div>

                    <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-slate-700">
                          IP Address:
                        </span>{" "}
                        {session.ipAddress || "Unavailable"}
                      </div>

                      <div>
                        <span className="font-medium text-slate-700">
                          Started:
                        </span>{" "}
                        {formatSessionDate(session.createdAt)}
                      </div>

                      <div>
                        <span className="font-medium text-slate-700">
                          Expires:
                        </span>{" "}
                        {formatSessionDate(session.expiresAt)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevokeSession(session)}
                    disabled={isRevokingSession || isRevokingAll}
                    className="shrink-0 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRevokingSession
                      ? "Ending..."
                      : session.isCurrent
                        ? "Log out"
                        : "End session"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Refresh Indicator */}
        {isFetching && !isLoading && (
          <p className="mt-4 text-right text-xs text-slate-400">
            Updating sessions...
          </p>
        )}
      </div>
    </main>
  );
}
