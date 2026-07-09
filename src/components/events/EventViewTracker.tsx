"use client";

import { useEffect } from "react";

interface Props {
  eventId: number;
}

export function EventViewTracker({ eventId }: Props) {
  useEffect(() => {
    // Track event view on mount
    fetch("/api/track-event-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    }).catch((error) => {
      console.error("Failed to track event view:", error);
    });
  }, [eventId]);

  return null;
}
