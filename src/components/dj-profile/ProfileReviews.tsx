"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, Calendar, PenLine } from "lucide-react";
import {
  Stars,
  SectionHeading,
  type ReviewItem,
} from "@/components/dj-profile/dj-profile-shared";
import { ReportButton } from "@/components/reporting/ReportButton";
import { useReviewModal } from "@/components/reputation/ReviewModalContext";
import { useUser } from "@/lib/supabase/useUser";

type Props = {
  avgRating: number;
  ratingCount: number;
  reviews: ReviewItem[];
  /** DJ profile context for the "Write Review" button */
  djProfileId?: number;
  djName?: string;
  djAvatar?: string | null;
  djSlug?: string;
  /** Whether the current user is the profile owner (suppresses "Write Review") */
  isOwner?: boolean;
};

type FilterTab = "all" | "direct" | "event";

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

export default function ProfileReviews({
  avgRating,
  ratingCount,
  reviews,
  djProfileId,
  djName,
  djAvatar,
  djSlug,
  isOwner = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const { openReviewModal } = useReviewModal();
  const { user, isLoaded } = useUser();

  // Count reviews by type for tab badges
  const counts = useMemo(() => {
    let direct = 0;
    let event = 0;
    for (const r of reviews) {
      if (r.event) {
        event++;
      } else {
        direct++;
      }
    }
    return { all: reviews.length, direct, event };
  }, [reviews]);

  // Filter reviews based on active tab
  const filteredReviews = useMemo(() => {
    if (activeTab === "direct") {
      return reviews.filter((r) => !r.event);
    }
    if (activeTab === "event") {
      return reviews.filter((r) => r.event);
    }
    return reviews;
  }, [reviews, activeTab]);

  // Only show tabs if there are reviews of both types
  const showTabs = counts.direct > 0 && counts.event > 0;

  const canWriteReview =
    djProfileId != null &&
    !Number.isNaN(djProfileId) &&
    djName != null &&
    !isOwner;

  function handleWriteReview() {
    if (!djProfileId || !djName) return;

    if (isLoaded && !user) {
      toast.error("Sign up to write a review", {
        description: (
          <Link
            href="/sign-up"
            className="text-white underline underline-offset-2 hover:text-gray-200"
          >
            Sign up
          </Link>
        ),
        duration: 5000,
      });
      return;
    }

    openReviewModal({
      djProfileId,
      djName,
      djAvatar,
      djSlug,
    });
  }

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <SectionHeading sub={`${ratingCount} verified reviews`}>
          Crowd Feedback
        </SectionHeading>
        {canWriteReview && (
          <Button
            onClick={handleWriteReview}
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 hover:bg-white/10"
          >
            <PenLine className="h-3.5 w-3.5" />
            Write Review
          </Button>
        )}
      </div>

      {/* Rating summary */}
      <div className="bg-h_blackLight/30 mb-5 flex flex-col gap-6 rounded-xl border border-white/5 p-5 sm:flex-row">
        <div className="flex min-w-24 shrink-0 flex-col items-center justify-center gap-1.5">
          <span className="text-5xl leading-none font-bold text-white">
            {avgRating.toFixed(1)}
          </span>
          <Stars rating={avgRating} size="lg" />
          <span className="text-xs text-gray-500">{ratingCount} reviews</span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = filteredReviews.filter((r) => r.rating === s).length;
            const pct =
              filteredReviews.length > 0
                ? Math.round((count / filteredReviews.length) * 100)
                : 0;
            return (
              <div key={s} className="flex items-center gap-3">
                <span className="w-3 text-right text-xs text-gray-400">
                  {s}
                </span>
                <Star className="h-3 w-3 shrink-0 text-amber-400" />
                <Progress value={pct} className="h-1.5 flex-1 bg-white/8" />
                <span className="w-8 text-right text-xs text-gray-600">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs (only when both types exist) */}
      {showTabs && (
        <div className="mb-4 flex gap-1.5">
          {(
            [
              { key: "all", label: "All", count: counts.all },
              { key: "direct", label: "Direct", count: counts.direct },
              { key: "event", label: "Event", count: counts.event },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTab === tab.key
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Reviews list */}
      <div className="flex flex-col gap-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/3 p-8 text-center">
            <p className="text-sm text-gray-500">
              {activeTab === "direct"
                ? "No direct reviews yet."
                : activeTab === "event"
                  ? "No event-anchored reviews yet."
                  : "No reviews yet."}
            </p>
            {canWriteReview && (
              <Button
                onClick={handleWriteReview}
                variant="outline"
                size="sm"
                className="mt-3 border-white/10 bg-white/5 hover:bg-white/10"
              >
                <PenLine className="h-3.5 w-3.5" />
                Be the first to review
              </Button>
            )}
          </div>
        ) : (
          filteredReviews.map((r) => (
            <Card
              key={r.id}
              className="bg-h_blackLight/30 gap-0 border-white/5 p-5"
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-9 shrink-0 ring-1 ring-white/10">
                  <AvatarImage src={r.user.image} />
                  <AvatarFallback className="bg-h_blackLight text-xs text-white">
                    {r.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {r.user.name}
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{r.date}</span>
                      <ReportButton
                        targetType="REVIEW"
                        targetId={String(r.id)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-white"
                      />
                    </div>
                  </div>

                  {/* Event context badge for event-anchored reviews */}
                  {r.event && (
                    <Link
                      href={`/events/${r.event.slug}`}
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/3 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
                    >
                      <Calendar className="h-3 w-3 shrink-0 text-gray-500" />
                      <span className="truncate">{r.event.title}</span>
                      <span className="text-gray-600">·</span>
                      <span className="shrink-0 text-gray-600">
                        {r.event.startDate}
                      </span>
                    </Link>
                  )}

                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    {r.review}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
