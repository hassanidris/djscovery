"use client";

import { SectionHeading } from "./dj-profile-shared";

type Venue = {
  id: number;
  venueName: string;
  eventDate?: string | null;
  description?: string | null;
  city: { name: string };
  country: { name: string };
};

type Props = {
  venues: Venue[];
};

export default function WhereIvePlayed({ venues }: Props) {
  if (!venues || venues.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    // Try to parse as full date or month-only
    if (dateString.includes("-")) {
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
        });
      }
    }
    return dateString;
  };

  return (
    <section>
      <SectionHeading>Where I&apos;ve Played</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <h3 className="font-medium text-white">{venue.venueName}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{venue.city.name}</span>
              <span>·</span>
              <span>{venue.country.name}</span>
              {venue.eventDate && (
                <>
                  <span>·</span>
                  <span>{formatDate(venue.eventDate)}</span>
                </>
              )}
            </div>
            {venue.description && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-300">
                {venue.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
