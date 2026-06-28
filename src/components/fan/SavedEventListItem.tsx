"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarHeart, MapPin, Calendar } from "lucide-react";
import RemoveSavedEventButton from "@/components/account/RemoveSavedEventButton";

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

type Event = {
  id: number;
  slug: string;
  title: string;
  posterUrl: string | null;
  startDate: Date;
  status: string;
  city: { name: string } | null;
  country: { name: string } | null;
  ownerDj: { slug: string; stageName: string } | null;
};

export default function SavedEventListItem({ event }: { event: Event }) {
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const badge = STATUS_BADGE[event.status];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5">
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

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/events/${event.slug}`}
            className="truncate text-sm font-semibold text-white hover:underline"
          >
            {event.title}
          </Link>
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
            {[event.city?.name, event.country?.name].filter(Boolean).join(", ")}
          </p>
        )}

        {event.ownerDj && (
          <p className="mt-1 truncate text-xs text-gray-500">
            by{" "}
            <Link
              href={`/djs/${event.ownerDj.slug}`}
              className="text-gray-400 hover:text-white"
            >
              {event.ownerDj.stageName}
            </Link>
          </p>
        )}
      </div>

      <RemoveSavedEventButton eventId={event.id} onSuccess={() => setRemoved(true)} />
    </div>
  );
}
