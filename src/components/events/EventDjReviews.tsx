"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Stars } from "@/components/dj-profile/dj-profile-shared";
import { Calendar, Star } from "lucide-react";
import { ReportButton } from "@/components/reporting/ReportButton";

type EventReview = {
  id: number;
  rating: number;
  review: string | null;
  reviewType: string | null;
  createdAt: Date;
  user: {
    username: string;
    image: string | null;
    name: string | null;
  };
  event: {
    id: number;
    slug: string;
    title: string;
    startDate: Date;
  } | null;
};

type EventDjReviewsResponse = {
  ratings: EventReview[];
  totalCount: number;
  hasNextPage: boolean;
  avgRating: number;
};

const REVIEW_TYPE_LABELS: Record<string, string> = {
  DIRECT: "Direct",
  EVENT_ATTENDEE: "Attendee",
  EVENT_ORGANIZER: "Organizer",
};

const REVIEW_TYPE_BADGE_CLASSES: Record<string, string> = {
  DIRECT: "border-white/10 bg-white/5 text-zinc-400",
  EVENT_ATTENDEE: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  EVENT_ORGANIZER: "border-purple-500/20 bg-purple-500/10 text-purple-400",
};

/**
 * Displays event-anchored DjRatings for a specific event.
 * Fetches from /api/djs/[slug]/ratings?eventId=N for each performer DJ,
 * aggregated into a single list.
 */
export function EventDjReviews({
  eventId,
  djSlugs,
}: {
  eventId: number;
  djSlugs: string[];
}) {
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [isLoading, setIsLoading] = useState(djSlugs.length > 0);

  // Stable string key for dependency array
  const djSlugsKey = djSlugs.join(",");

  useEffect(() => {
    if (djSlugsKey.length === 0) return;

    let cancelled = false;

    async function fetchAllReviews() {
      try {
        const slugs = djSlugsKey.split(",");
        // Fetch event-anchored reviews from each DJ's ratings endpoint
        const results = await Promise.all(
          slugs.map((slug) =>
            fetch(
              `/api/djs/${slug}/ratings?page=1&limit=50&eventId=${eventId}`,
            ).then((res) => (res.ok ? res.json() : null)),
          ),
        );

        if (cancelled) return;

        // Flatten and sort by date desc
        const allReviews: EventReview[] = [];
        for (const result of results) {
          if (result && Array.isArray(result.ratings)) {
            allReviews.push(...result.ratings);
          }
        }
        allReviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setReviews(allReviews);
      } catch (error) {
        console.error("Failed to fetch event DJ reviews:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAllReviews();
    return () => {
      cancelled = true;
    };
  }, [eventId, djSlugsKey]);

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          DJ Reviews from this Event
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-white/5 bg-white/3 p-4"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-full animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
        DJ Reviews from this Event
      </h2>
      <div className="space-y-3">
        {reviews.map((r) => (
          <Card
            key={r.id}
            className="bg-h_blackLight/30 gap-0 border-white/5 p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar className="size-9 shrink-0 ring-1 ring-white/10">
                <AvatarImage src={r.user.image || undefined} />
                <AvatarFallback className="bg-h_blackLight text-xs text-white">
                  {(r.user.name || r.user.username || "?")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {r.user.name || r.user.username}
                    </span>
                    <Stars rating={r.rating} />
                    {r.reviewType && (
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                          REVIEW_TYPE_BADGE_CLASSES[r.reviewType] ??
                          REVIEW_TYPE_BADGE_CLASSES.DIRECT
                        }`}
                      >
                        {REVIEW_TYPE_LABELS[r.reviewType] ?? r.reviewType}
                      </span>
                    )}
                  </div>
                  <ReportButton
                    targetType="REVIEW"
                    targetId={String(r.id)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-white"
                  />
                </div>
                <span className="mt-1 block text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {r.review && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    {r.review}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
