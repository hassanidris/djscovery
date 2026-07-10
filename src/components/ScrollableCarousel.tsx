"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  gap?: number;
  peek?: number;
  showArrows?: boolean;
  showFade?: boolean;
};

export default function ScrollableCarousel({
  children,
  className,
  contentClassName,
  gap = 16,
  peek = 24,
  showArrows = true,
  showFade = true,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 288;
    el.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        style={{ paddingRight: peek }}
        className={cn(
          "flex scrollbar-none gap-4 overflow-x-auto [-ms-overflow-style:none]",
          contentClassName,
        )}
      >
        {children}
      </div>

      {showFade && canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-black via-black/70 to-transparent" />
      )}
      {showFade && canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-black via-black/70 to-transparent" />
      )}

      {showArrows && canScrollLeft && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => scrollBy(-1)}
          className="absolute top-1/2 left-0 z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/80 text-white shadow-lg hover:bg-black"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {showArrows && canScrollRight && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => scrollBy(1)}
          className="absolute top-1/2 right-0 z-10 flex size-8 translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/80 text-white shadow-lg hover:bg-black"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
