import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CalendarHeart, MapPin, CalendarDays } from "lucide-react";
import { getSavedEvents } from "@/lib/actions/follows";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Saved Events" };

export default async function OrganizerSavedEventsPage() {
  const events = await getSavedEvents();

  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">Saved Events</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-20 text-center">
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
            and save ones you&apos;re interested in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Saved Events</h2>
        <p className="text-sm text-gray-500">
          {events.length} saved {events.length === 1 ? "event" : "events"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-4 rounded-xl border border-white/6 bg-white/3 px-4 py-4 transition-colors hover:bg-white/5"
          >
            {event.posterUrl ? (
              <Image
                src={event.posterUrl}
                alt={event.title}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/8">
                <CalendarDays className="h-6 w-6 text-gray-600" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <Link href={`/events/${event.slug}`}>
                <p className="truncate text-sm font-semibold text-white hover:underline">
                  {event.title}
                </p>
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(event.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {(event.city || event.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[event.city?.name, event.country?.name]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </div>
              {event.ownerDj && (
                <p className="mt-0.5 text-xs text-gray-600">
                  by {event.ownerDj.stageName}
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className={
                event.status === "PUBLISHED"
                  ? "border-green-500/30 text-green-400"
                  : "border-white/10 text-gray-500"
              }
            >
              {event.status === "PUBLISHED" ? "Live" : event.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
