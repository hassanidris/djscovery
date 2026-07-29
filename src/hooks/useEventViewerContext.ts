"use client";

import { useEffect, useRef, useState } from "react";

export interface EventViewerState {
  isOwner: boolean;
  isOrganizer: boolean;
  hasAttended: boolean;
  reviewedDjIds: number[];
  attendanceStatus: "GOING" | "INTERESTED" | null;
  privateVenue: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const DEFAULT_STATE: Omit<EventViewerState, "isLoading"> = {
  isOwner: false,
  isOrganizer: false,
  hasAttended: false,
  reviewedDjIds: [],
  attendanceStatus: null,
  privateVenue: null,
  isAuthenticated: false,
};

/**
 * Fetches per-viewer state (ownership, attendance, review eligibility) for
 * an event. Runs client-side so the parent page can remain a static,
 * ISR-cached shell with no auth/cookie reads.
 */
export function useEventViewerContext(eventId?: number): EventViewerState {
  const [state, setState] = useState(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(!!eventId);
  const prevEventIdRef = useRef(eventId);

  useEffect(() => {
    if (!eventId) return;

    // Only set loading to true if eventId changed (not on initial mount)
    if (eventId !== prevEventIdRef.current) {
      setIsLoading(true);
    }
    prevEventIdRef.current = eventId;

    let cancelled = false;

    fetch(`/api/events/${eventId}/viewer-context`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setState({
          isOwner: !!data.isOwner,
          isOrganizer: !!data.isOrganizer,
          hasAttended: !!data.hasAttended,
          reviewedDjIds: data.reviewedDjIds ?? [],
          attendanceStatus: data.attendanceStatus ?? null,
          privateVenue: data.privateVenue ?? null,
          isAuthenticated: !!data.isAuthenticated,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch event viewer context:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return { ...state, isLoading };
}
