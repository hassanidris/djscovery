"use client";

import { useState, useLayoutEffect } from "react";

/**
 * Returns true when the viewport is at the Tailwind `md` breakpoint (≥768px).
 * Uses useLayoutEffect so the state is set synchronously before any useEffect
 * runs — preventing a component that's about to unmount from firing side-effects.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}
