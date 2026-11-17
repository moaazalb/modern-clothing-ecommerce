const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Formats an ISO date string returned by the API for display.
 *
 * @param isoDate - Date string such as "2026-11-17T10:30:00.000Z".
 * @returns The formatted date and time, or an empty string when the date is invalid.
 */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);

  return Number.isNaN(date.getTime()) ? "" : dateTimeFormatter.format(date);
}