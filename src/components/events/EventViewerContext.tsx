"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import {
  useEventViewerContext,
  type EventViewerState,
} from "@/hooks/useEventViewerContext";
import AttendanceButton from "@/components/events/AttendanceButton";
import {
  EventReviewSection,
  type ReviewableDj,
} from "@/components/reputation/EventReviewSection";

const EventViewerCtx = createContext<EventViewerState | null>(null);

function useEventViewer(): EventViewerState {
  const ctx = useContext(EventViewerCtx);
  if (!ctx) {
    throw new Error("useEventViewer must be used within EventViewerProvider");
  }
  return ctx;
}

/**
 * Fetches per-viewer state for an event ONCE and shares it with the small
 * consumer components below via context. The parent page/server component
 * stays static (ISR-cached); this provider is the only dynamic/client piece.
 */
export function EventViewerProvider({
  eventId,
  children,
}: {
  eventId: number;
  children: ReactNode;
}) {
  const state = useEventViewerContext(eventId);
  return (
    <EventViewerCtx.Provider value={state}>{children}</EventViewerCtx.Provider>
  );
}

export function EditEventLink({ editHref }: { editHref: string }) {
  const { isOwner } = useEventViewer();
  if (!isOwner) return null;
  return (
    <Link
      href={editHref}
      className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
    >
      Edit Event
    </Link>
  );
}

export function AttendanceSlot({
  eventId,
  isUpcoming,
}: {
  eventId: number;
  isUpcoming: boolean;
}) {
  const { isAuthenticated, attendanceStatus, isLoading } = useEventViewer();
  if (isLoading || !isAuthenticated) return null;
  return (
    <AttendanceButton
      eventId={eventId}
      currentStatus={attendanceStatus}
      isUpcoming={isUpcoming}
    />
  );
}

export function PrivateVenueNote({
  publicLocation,
}: {
  publicLocation: string;
}) {
  const { privateVenue, isOwner } = useEventViewer();
  if (!isOwner || !privateVenue) {
    return (
      <p className="text-zinc-500">
        {publicLocation ? "Venue hidden — private event" : "Private event"}
      </p>
    );
  }
  return (
    <>
      <p>{privateVenue}</p>
      {publicLocation && <p className="text-zinc-500">{publicLocation}</p>}
    </>
  );
}

export function EventReviewSlot({
  eventId,
  status,
  djs,
}: {
  eventId: number;
  status: string;
  djs: ReviewableDj[];
}) {
  const { hasAttended, reviewedDjIds, isOrganizer, isLoading } =
    useEventViewer();
  if (isLoading || status !== "COMPLETED" || !hasAttended) return null;
  return (
    <EventReviewSection
      eventId={eventId}
      djs={djs}
      reviewedDjIds={reviewedDjIds}
      isOrganizer={isOrganizer}
    />
  );
}
