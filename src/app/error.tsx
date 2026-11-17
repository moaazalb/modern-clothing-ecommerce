"use client";

import type { ReactElement } from "react";

import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

/**
 * Shown when a page fails while loading its data.
 *
 * @param props - Error boundary props.
 * @returns The error view with a retry button.
 */
export default function ErrorPage({ reset }: ErrorPageProps): ReactElement {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16">
      <ErrorMessage />

      <Button type="button" variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}