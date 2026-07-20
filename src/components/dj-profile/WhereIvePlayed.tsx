"use client";

import { useState, memo } from "react";
import { List, Map, Plus } from "lucide-react";
import { SectionHeading } from "./dj-profile-shared";
import VenueMap from "./VenueMap";
import { Button } from "@/components/ui/button";

type Venue = {
  id: number;
  venueName: string;
  eventDate?: string | null;
  description?: string | null;
  city: { name: string };
  country: { name: string };
  latitude?: number | null;
  longitude?: number | null;
};

type Props = {
  venues: Venue[];
  isOwner?: boolean;
  onAddVenue?: () => void;
};

function WhereIvePlayed({ venues, isOwner, onAddVenue }: Props) {
  const [view, setView] = useState<"list" | "map">("list");

  if (!venues || venues.length === 0) {
    if (isOwner && onAddVenue) {
      return (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <SectionHeading>Where I&apos;ve Played</SectionHeading>
            <Button
              onClick={onAddVenue}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-white"
            >
              <Plus className="mr-1.5 h-3 w-3" />
              Add Venues
            </Button>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-gray-400">
              No venues added yet. Add venues you&apos;ve played at to showcase
              your experience.
            </p>
          </div>
        </section>
      );
    }
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

  // Filter venues with coordinates for map view
  const venuesWithCoords = venues.filter(
    (v) => v.latitude != null && v.longitude != null,
  );

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <SectionHeading>Where I&apos;ve Played</SectionHeading>
        <div className="flex items-center gap-2">
          {venuesWithCoords.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`rounded-lg p-2 transition-colors ${
                  view === "list"
                    ? "bg-h_red text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("map")}
                className={`rounded-lg p-2 transition-colors ${
                  view === "map"
                    ? "bg-h_red text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          )}
          {isOwner && onAddVenue && (
            <Button
              onClick={onAddVenue}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-white"
            >
              <Plus className="mr-1.5 h-3 w-3" />
              Add Venues
            </Button>
          )}
        </div>
      </div>

      {view === "map" && venuesWithCoords.length > 0 ? (
        <VenueMap
          venues={venuesWithCoords.map((v) => ({
            id: v.id,
            venueName: v.venueName,
            city: { name: v.city.name },
            country: { name: v.country.name },
            lat: v.latitude!,
            lng: v.longitude!,
            eventDate: v.eventDate,
          }))}
        />
      ) : (
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
      )}
    </section>
  );
}

export default memo(WhereIvePlayed);
