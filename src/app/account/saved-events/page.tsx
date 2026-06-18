import Image from "next/image";
import Link from "next/link";
import { CalendarHeart, MapPin, Calendar } from "lucide-react";
import { getSavedEvents } from "@/lib/actions/saves";
import RemoveSavedEventButton from "@/components/account/RemoveSavedEventButton";

export const metadata = { title: "Saved Events" };

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-950/60 text-red-300",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-white/8 text-gray-400",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-white/8 text-gray-500",
  },
};

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function SavedEventsPage() {
  const savedEvents = await getSavedEvents();

  if (savedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <CalendarHeart className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-sm font-medium text-white">No saved events yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Browse{" "}
          <Link
            href="/events"
            className="text-white underline underline-offset-2"
          >
            upcoming events
          </Link>{" "}
          and save the ones you want to attend.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-4 text-sm text-gray-500">
        {savedEvents.length} saved{" "}
        {savedEvents.length === 1 ? "event" : "events"}
      </p>
      {savedEvents.map((event) => {
        const badge = STATUS_BADGE[event.status];
        return (
          <div
            key={event.id}
            className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5"
          >
            <Link href={`/events/${event.slug}`} className="shrink-0">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-white/8">
                {event.posterUrl ? (
                  <Image
                    src={event.posterUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <CalendarHeart className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            </Link>

            <Link href={`/events/${event.slug}`} className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-white">
                  {event.title}
                </span>
                {badge && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )}
              </div>

              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3 shrink-0" />
                {formatEventDate(event.startDate)}
              </p>

              {(event.city || event.country) && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {[event.city?.name, event.country?.name]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              {event.ownerDj && (
                <p className="mt-1 truncate text-xs text-gray-500">
                  by{" "}
                  <Link
                    href={`/djs/${event.ownerDj.slug}`}
                    className="text-gray-400 hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {event.ownerDj.stageName}
                  </Link>
                </p>
              )}
            </Link>

            <RemoveSavedEventButton eventId={event.id} />
          </div>
        );
      })}
    </div>
  );
}
