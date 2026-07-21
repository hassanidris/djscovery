"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface FitBoundsProps {
  venues: Array<{ lat: number; lng: number }>;
}

export default function FitBounds({ venues }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (venues.length === 0) return;
    import("leaflet").then((L) => {
      const latLngs = venues.map((v) => L.latLng(v.lat, v.lng));
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    });
  }, [map, venues]);

  return null;
}
