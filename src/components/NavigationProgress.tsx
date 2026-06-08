"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [show, setShow] = useState(false);
  const [complete, setComplete] = useState(false);

  const prevRef = useRef(`${pathname}${searchParams}`);
  const isLoadingRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cancelTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const startLoading = () => {
    cancelTimers();
    isLoadingRef.current = true;
    setComplete(false);
    setShow(true);
  };

  const finishLoading = () => {
    if (!isLoadingRef.current) return;
    cancelTimers();
    isLoadingRef.current = false;
    setComplete(true);
    timers.current.push(
      setTimeout(() => {
        setShow(false);
        setComplete(false);
      }, 500),
    );
  };

  useEffect(() => {
    const curr = `${pathname}${searchParams}`;
    if (curr !== prevRef.current) {
      prevRef.current = curr;
      finishLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank"
      )
        return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === pathname && !url.search) return;
        startLoading();
      } catch {
        // ignore unparseable hrefs
      }
    };
    document.addEventListener("click", handler, true);
    return () => {
      document.removeEventListener("click", handler, true);
      cancelTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className={`fixed top-0 left-0 z-[9999] h-0.5 bg-h_red pointer-events-none ${
        complete
          ? "w-full opacity-0 transition-all duration-300"
          : "animate-nav-progress"
      }`}
    />
  );
}

export function NavigationProgress() {
  return (
    <Suspense>
      <ProgressBar />
    </Suspense>
  );
}
