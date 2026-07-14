import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SaveEventButton from "@/components/events/SaveEventButton";

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

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EventCard({
  event,
  isSaved = false,
}: {
  event: EventCardItem;
  isSaved?: boolean;
}) {
  const isPrivate = event.eventType === "PRIVATE";
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category;

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="bg-h_blackLight/50 hover:ring-h_red cursor-pointer gap-0 overflow-hidden p-0 ring-white/5 transition-all hover:ring-1">
        {/* ── Header with poster / gradient + title ── */}
        <div className="relative flex h-36 items-end overflow-hidden p-4">
          {event.posterUrl ? (
            <Image
              src={event.posterUrl}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="bg-h_redDark/20 absolute inset-0" />
          )}

          {/* Gradient overlay */}
          <div className="from-h_redDark/40 absolute inset-0 bg-linear-to-br to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          {/* Save button — top right, DB events only */}
          {event.eventId !== undefined && (
            <div className="absolute top-2 right-2 z-10">
              <SaveEventButton eventId={event.eventId} isSaved={isSaved} />
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {isPrivate && (
              <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-zinc-400 backdrop-blur-sm">
                <Lock className="h-2.5 w-2.5" />
                Private
              </span>
            )}
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-zinc-300 backdrop-blur-sm">
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="relative text-lg leading-tight font-bold tracking-wide text-white drop-shadow-md">
            {event.title}
          </h3>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>📅</span>
            <span>{formatDate(event.startDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>📍</span>
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.djName && (
            <Badge className="bg-h_redDark/60 mt-1 w-fit border-0 text-red-300">
              🎧 Dj. {event.djName}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
