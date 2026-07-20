"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPinned, List, Map } from "lucide-react";
import { SectionHeading } from "@/components/dj-profile/dj-profile-shared";
import type { VenueItem } from "@/components/dj-profile/dj-profile-shared";
import VenueMap from "./VenueMap";

type Props = {
  venues: VenueItem[];
  grid?: boolean;
  venuesWithCoords?: Array<VenueItem & { lat: number; lng: number }>;
};

export default function ProfileVenues({
  venues,
  grid = false,
  venuesWithCoords,
}: Props) {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <SectionHeading>Where I&apos;ve Played</SectionHeading>
        {venuesWithCoords && venuesWithCoords.length > 0 && (
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
      </div>

      {view === "map" && venuesWithCoords ? (
        <VenueMap
          venues={venuesWithCoords.map((v, i) => ({
            id: i,
            venueName: v.name,
            city: { name: v.city },
            country: { name: v.country || "" },
            lat: v.lat,
            lng: v.lng,
            count: v.count,
          }))}
        />
      ) : (
        <div
          className={grid ? "grid gap-2 sm:grid-cols-2" : "flex flex-col gap-2"}
        >
          {venues.map((v, i) => (
            <div
              key={i}
              className="bg-h_blackLight/30 flex items-center gap-3 rounded-lg border border-white/5 p-3 transition-colors hover:border-white/10"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/8 bg-white/5">
                <MapPinned className="text-h_red h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{v.name}</p>
                <p className="text-xs text-gray-500">
                  {v.city}
                  {v.country ? `, ${v.country}` : ""}
                </p>
              </div>
              <Badge className="shrink-0 border-white/10 bg-white/5 text-xs text-gray-400">
                {v.count}x
              </Badge>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
