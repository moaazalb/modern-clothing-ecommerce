
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactElement, ReactNode } from "react";

import { useAppSelector } from "@/store/hooks";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protects routes that require an authenticated user.
 *
 * Waits for session initialization before deciding whether
 * the user can access the requested page.
 */
export function ProtectedRoute({
  children,
}: ProtectedRouteProps): ReactElement {
  const router = useRouter();

  const status = useAppSelector((state) => state.auth.status);

  /**
   * Redirects unauthenticated users to the login page.
   */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        {status === "unknown"
          ? "Checking your session..."
          : "Redirecting to login..."}
      </div>
    );
  }

  return <>{children}</>;
}
