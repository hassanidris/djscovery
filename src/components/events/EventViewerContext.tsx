"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { PenLine, CheckCircle2 } from "lucide-react";
import {
  useEventViewerContext,
  type EventViewerState,
} from "@/hooks/useEventViewerContext";
import AttendanceButton from "@/components/events/AttendanceButton";
import { useReviewModal } from "@/components/reputation/ReviewModalContext";

export type ReviewableDj = {
  djProfileId: number;
  slug: string;
  stageName: string;
  avatar: string | null;
};

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
  eventTitle,
  eventSlug,
  eventStartDate,
  eventCity,
}: {
  eventId: number;
  status: string;
  djs: ReviewableDj[];
  eventTitle?: string;
  eventSlug?: string;
  eventStartDate?: Date | string;
  eventCity?: string;
}) {
  const { canReview, reviewedDjIds, isOrganizer, isLoading } = useEventViewer();
  const { openReviewModal } = useReviewModal();

  if (isLoading || status !== "COMPLETED" || !canReview) return null;
  if (djs.length === 0) return null;

  function handleReviewClick(dj: ReviewableDj) {
    openReviewModal({
      djProfileId: dj.djProfileId,
      djName: dj.stageName,
      djAvatar: dj.avatar,
      djSlug: dj.slug,
      eventId,
      eventTitle,
      eventSlug,
      eventStartDate,
      eventCity,
      isOrganizer,
    });
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
        Review the DJs
      </h2>
      <div className="space-y-2">
        {djs.map((dj) => {
          const alreadyReviewed = reviewedDjIds.includes(dj.djProfileId);
          return (
            <div
              key={dj.djProfileId}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                {dj.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dj.avatar}
                    alt={dj.stageName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">
                    {dj.stageName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/djs/${dj.slug}`}
                  className="text-sm font-medium text-white hover:underline"
                >
                  DJ. {dj.stageName}
                </Link>
                {alreadyReviewed ? (
                  <p className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Reviewed
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    {isOrganizer
                      ? "Share your experience as organizer"
                      : "Share your experience"}
                  </p>
                )}
              </div>
              {!alreadyReviewed && (
                <button
                  onClick={() => handleReviewClick(dj)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-zinc-600 hover:bg-zinc-700"
                >
                  <PenLine className="h-3 w-3" />
                  Review
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
