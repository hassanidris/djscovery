/**
 * Centralized date formatting utilities to ensure consistent date rendering
 * across server and client, preventing hydration mismatches.
 */

/**
 * Format a date in a consistent format for event cards and displays.
 * Uses en-US locale with consistent options to prevent hydration mismatches.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date with weekday for gig cards and detailed displays.
 */
export function formatDateWithWeekday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date in a short format (e.g., "Sep 16, 2026").
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date in a long format (e.g., "September 16, 2026").
 */
export function formatLongDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date in a compact format (e.g., "9/16/2026").
 */
export function formatCompactDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string (YYYY-MM-DD or YYYY-MM) for venue history.
 * Handles both full dates and month-only dates.
 */
export function formatVenueDate(dateString: string): string {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    // Full date: YYYY-MM-DD
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } else if (parts.length === 2) {
    // Month only: YYYY-MM
    const date = new Date(`${dateString}-01`);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  return dateString;
}
