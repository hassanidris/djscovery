import Link from "next/link";
import Image from "next/image";
import { Lock, Calendar, MapPin, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SaveEventButton from "@/components/events/SaveEventButton";
import { useMemo } from "react";
import React from "react";
import { formatDate } from "@/lib/utils/date";

// ── Type ──────────────────────────────────────────────────────────────────────

export type EventCardItem = {
  slug: string;
  title: string;
  eventType: string;
  category: string;
  startDate: Date;
  posterUrl: string | null;
  location: string;
  djName: string;
  djSlug: string | null;
  isDemo?: boolean;
  eventId?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  CLUB_NIGHT: "Club Night",
  FESTIVAL: "Festival",
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  BEACH_PARTY: "Beach Party",
  LOUNGE: "Lounge",
  RESTAURANT_SET: "Restaurant Set",
  PRIVATE_PARTY: "Private Party",
  OPEN_AIR: "Open Air",
  LUXURY_EVENT: "Luxury Event",
  OTHER: "Other",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function EventCard({
  event,
  isSaved = false,
  priority = false,
}: {
  event: EventCardItem;
  isSaved?: boolean;
  priority?: boolean;
}) {
  const isPrivate = useMemo(
    () => event.eventType === "PRIVATE",
    [event.eventType],
  );
  const categoryLabel = useMemo(
    () => CATEGORY_LABELS[event.category] ?? event.category,
    [event.category],
  );

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="bg-h_blackLight/50 hover:ring-h_red cursor-pointer gap-0 overflow-hidden p-0 ring-white/5 transition-all hover:ring-1">
        {/* ── Header with poster / gradient + title ── */}
        <div
          className="relative flex h-36 items-end overflow-hidden p-4"
          style={{ padding: "var(--space-4)" }}
        >
          {event.posterUrl ? (
            <Image
              src={event.posterUrl}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={priority}
            />
          ) : (
            <div className="bg-h_redDark/20 absolute inset-0" />
          )}

          {/* Simplified gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          {/* Save button — top right, DB events only */}
          {event.eventId !== undefined && (
            <div
              className="absolute top-2 right-2 z-10"
              style={{ top: "var(--space-2)", right: "var(--space-2)" }}
            >
              <SaveEventButton eventId={event.eventId} isSaved={isSaved} />
            </div>
          )}

          {/* Simplified badges */}
          <div
            className="absolute top-3 left-3 flex flex-wrap gap-1.5"
            style={{
              top: "var(--space-3)",
              left: "var(--space-3)",
              gap: "var(--space-1)",
            }}
          >
            {isPrivate && (
              <span
                className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-zinc-400 backdrop-blur-sm"
                style={{ gap: "var(--space-1)", padding: "0 var(--space-2)" }}
              >
                <Lock className="h-2.5 w-2.5" />
                Private
              </span>
            )}
            <span
              className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-zinc-300 backdrop-blur-sm"
              style={{ padding: "0 var(--space-2)" }}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="relative text-lg leading-tight font-bold tracking-wide text-white drop-shadow-md">
            {event.title}
          </h3>
        </div>

        {/* ── Body ── */}
        <div
          className="flex flex-col gap-2 p-4"
          style={{ gap: "var(--space-2)", padding: "var(--space-4)" }}
        >
          <div
            className="flex items-center gap-2 text-sm text-gray-300"
            style={{ gap: "var(--space-2)" }}
          >
            <Calendar className="text-h_redLight h-4 w-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          {event.location && (
            <div
              className="flex items-center gap-2 text-sm text-gray-300"
              style={{ gap: "var(--space-2)" }}
            >
              <MapPin className="text-h_redLight h-4 w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.djName && (
            <Badge
              className="bg-h_redDark/60 mt-1 w-fit border-0 text-red-300"
              style={{ marginTop: "var(--space-1)" }}
            >
              <Headphones className="mr-1 h-3 w-3" />
              Dj. {event.djName}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}

function areEventCardPropsEqual(
  prevProps: { event: EventCardItem; isSaved?: boolean; priority?: boolean },
  nextProps: { event: EventCardItem; isSaved?: boolean; priority?: boolean },
): boolean {
  return (
    prevProps.event.slug === nextProps.event.slug &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.event.eventType === nextProps.event.eventType &&
    prevProps.event.category === nextProps.event.category &&
    prevProps.event.startDate.getTime() ===
      nextProps.event.startDate.getTime() &&
    prevProps.event.posterUrl === nextProps.event.posterUrl &&
    prevProps.event.location === nextProps.event.location &&
    prevProps.event.djName === nextProps.event.djName &&
    prevProps.event.djSlug === nextProps.event.djSlug &&
    prevProps.event.isDemo === nextProps.event.isDemo &&
    prevProps.event.eventId === nextProps.event.eventId &&
    prevProps.isSaved === nextProps.isSaved &&
    prevProps.priority === nextProps.priority
  );
}

export default React.memo(EventCard, areEventCardPropsEqual);
