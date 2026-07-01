"use client";

import { useEffect } from "react";

type Props = {
  djProfileId: number;
  status: string;
  hidden: boolean;
};

export function ProfileViewTracker({ djProfileId, status, hidden }: Props) {
  useEffect(() => {
    // Only track for approved, non-hidden profiles
    if (status !== "APPROVED" || hidden) return;

    // Use sendBeacon for reliable tracking even if user navigates away
    const trackView = async () => {
      try {
        await fetch("/api/track-profile-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ djProfileId }),
          keepalive: true,
        });
      } catch (error) {
        // Silently fail - tracking shouldn't break the UX
      }
    };

    trackView();
  }, [djProfileId, status, hidden]);

  return null;
}
