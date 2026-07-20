"use client";

import { useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

import "leaflet/dist/leaflet.css";

interface VenueMapProps {
  venues: Array<{
    id: number;
    venueName: string;
    city: { name: string };
    country: { name: string };
    lat: number;
    lng: number;
    count?: number;
    eventDate?: string | null;
  }>;
}

function VenueMap({ venues }: VenueMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Fix for default marker icons in Next.js (client-side only)
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isClient || venues.length === 0) return null;

  // Calculate center point
  const avgLat = venues.reduce((sum, v) => sum + v.lat, 0) / venues.length;
  const avgLng = venues.reduce((sum, v) => sum + v.lng, 0) / venues.length;

  return (
    <div className="relative z-0 h-100 w-full overflow-hidden rounded-lg border border-white/10">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map((venue) => (
          <Marker key={venue.id} position={[venue.lat, venue.lng]}>
            <Popup className="z-10000">
              <div className="text-sm">
                <strong>{venue.venueName}</strong>
                <br />
                {venue.city.name}, {venue.country.name}
                {venue.eventDate && (
                  <>
                    <br />
                    <span className="font-medium text-white">
                      {venue.eventDate}
                    </span>
                  </>
                )}
                {venue.count && venue.count > 1 && (
                  <>
                    <br />
                    <span className="text-gray-400">
                      Played {venue.count} times
                    </span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default memo(VenueMap);
