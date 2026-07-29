"use client";

import { useEffect, useState } from "react";

/**
 * Fetches the current viewer's followed-DJ ids client-side, so pages like
 * /directory can remain a static, ISR-cached shell with no auth/cookie reads.
 */
export function useFollowedDjIds(): number[] {
  const [followedDjIds, setFollowedDjIds] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/follows/followed-ids")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setFollowedDjIds(data.followedDjIds ?? []);
      })
      .catch((error) => {
        console.error("Failed to fetch followed DJ ids:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return followedDjIds;
}
