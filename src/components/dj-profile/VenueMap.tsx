"use client";

import { useEffect, memo, useState } from "react";
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
const FitBounds = dynamic(() => import("./FitBounds"), { ssr: false });

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
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    // Create custom branded red marker icon (client-side only)
    import("leaflet").then((L) => {
      const redIcon = L.divIcon({
        className: "djcovery-marker",
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#e23744"/>
          <circle cx="12" cy="12" r="5" fill="#fff"/>
        </svg>`,
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32],
      });
      setIcon(redIcon);
    });
  }, []);

  if (venues.length === 0) return null;

  return (
    <div className="relative z-0 h-100 w-full overflow-hidden rounded-lg border border-white/10">
      <MapContainer
        center={[venues[0].lat, venues[0].lng]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
      >
        <FitBounds venues={venues.map((v) => ({ lat: v.lat, lng: v.lng }))} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {icon &&
          venues.map((venue) => (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={icon}
            >
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
