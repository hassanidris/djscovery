"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Calendar,
  PenLine,
  Briefcase,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  Stars,
  SectionHeading,
  type ReviewItem,
} from "@/components/dj-profile/dj-profile-shared";
import { ReportButton } from "@/components/reporting/ReportButton";
import { useReviewModal } from "@/components/reputation/ReviewModalContext";
import { DjRatingHelpfulButton } from "@/components/reputation/DjRatingHelpfulButton";
import { DjRatingResponse } from "@/components/reputation/DjRatingResponse";
import { useUser } from "@/lib/supabase/useUser";

type FilterTab = "all" | "direct" | "event" | "gig";
type SortOption = "newest" | "oldest" | "highest" | "lowest" | "mostHelpful";

type Props = {
  avgRating: number;
  ratingCount: number;
  reviews: ReviewItem[];
  djProfileId?: number;
  djName?: string;
  djAvatar?: string | null;
  djSlug?: string;
  isOwner?: boolean;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onTabChange?: (tab: FilterTab) => void;
  onSortChange?: (sort: SortOption) => void;
  totalDirectCount?: number;
  totalEventCount?: number;
  totalGigCount?: number;
};

const REVIEW_TYPE_LABELS: Record<string, string> = {
  DIRECT: "Direct",
  EVENT_ATTENDEE: "Attendee",
  EVENT_ORGANIZER: "Organizer",
  GIG_ORGANIZER: "Gig-Organizer",
};

const REVIEW_TYPE_BADGE_CLASSES: Record<string, string> = {
  DIRECT: "border-white/10 bg-white/5 text-zinc-400",
  EVENT_ATTENDEE: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  EVENT_ORGANIZER: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  GIG_ORGANIZER: "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  DJ: "DJ",
  ORGANIZER: "Organizer",
  FAN: "Fan",
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  ADMIN: "border-red-500/20 bg-red-500/10 text-red-400",
  DJ: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  ORGANIZER: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  FAN: "border-white/10 bg-white/5 text-zinc-400",
};

function getPrimaryRole(roles: string[] | undefined): string | null {
  if (!roles || roles.length === 0) return null;
  // Priority: ORGANIZER > DJ > FAN > ADMIN
  if (roles.includes("ORGANIZER")) return "ORGANIZER";
  if (roles.includes("DJ")) return "DJ";
  if (roles.includes("FAN")) return "FAN";
  if (roles.includes("ADMIN")) return "ADMIN";
  return roles[0];
}

export default function ProfileReviews({
  avgRating,
  ratingCount,
  reviews,
  djProfileId,
  djName,
  djAvatar,
  djSlug,
  isOwner = false,
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
  onTabChange,
  onSortChange,
  totalDirectCount,
  totalEventCount,
  totalGigCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [activeSort, setActiveSort] = useState<SortOption>("newest");
  const { openReviewModal } = useReviewModal();
  const { user, isLoaded } = useUser();

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleSortChange = (sort: SortOption) => {
    setActiveSort(sort);
    onSortChange?.(sort);
  };

  // Count reviews by type for tab badges.
  // Use persistent counts from parent when available (non-zero means loaded).
  // Fall back to counting from current reviews while counts are loading.
  const counts = useMemo(() => {
    // Count from current reviews (always works as a baseline)
    let directFromReviews = 0;
    let eventFromReviews = 0;
    let gigFromReviews = 0;
    for (const r of reviews) {
      if (r.reviewType === "GIG_ORGANIZER" || r.gig) {
        gigFromReviews++;
      } else if (r.event) {
        eventFromReviews++;
      } else {
        directFromReviews++;
      }
    }

    // Use persistent counts from parent if they're greater than what we see
    // (parent counts include ALL reviews, not just the current page)
    const direct = totalDirectCount ?? directFromReviews;
    const event = totalEventCount ?? eventFromReviews;
    const gig = totalGigCount ?? gigFromReviews;

    return {
      all: direct + event + gig,
      direct,
      event,
      gig,
    };
  }, [reviews, totalDirectCount, totalEventCount, totalGigCount]);

  // The API filters server-side, so reviews already match the active tab.
  // Client-side filter is a fallback for backward compatibility.
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    if (activeTab === "direct") {
      filtered = reviews.filter(
        (r) => !r.event && !r.gig && r.reviewType !== "GIG_ORGANIZER",
      );
    } else if (activeTab === "event") {
      filtered = reviews.filter((r) => r.event);
    } else if (activeTab === "gig") {
      filtered = reviews.filter(
        (r) => r.reviewType === "GIG_ORGANIZER" || r.gig,
      );
    }

    // Apply sorting
    if (activeSort === "newest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    } else if (activeSort === "oldest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } else if (activeSort === "highest") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (activeSort === "lowest") {
      filtered = [...filtered].sort((a, b) => a.rating - b.rating);
    } else if (activeSort === "mostHelpful") {
      filtered = [...filtered].sort(
        (a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0),
      );
    }

    return filtered;
  }, [reviews, activeTab, activeSort]);

  // Show tabs if there are any reviews at all
  const showTabs = counts.all > 0;

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

  const tabs = [
    { key: "all" as const, label: "All", count: counts.all },
    { key: "direct" as const, label: "Direct", count: counts.direct },
    { key: "event" as const, label: "Events", count: counts.event },
    { key: "gig" as const, label: "Gigs", count: counts.gig },
  ];

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
          <span className="text-xs text-gray-400">{ratingCount} reviews</span>
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
                <span className="w-8 text-right text-xs text-gray-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      {showTabs && (
        <div className="mb-4 flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Sort controls */}
      {showTabs && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-400">Sort by:</span>
          </div>
          <div className="flex gap-1">
            {[
              { key: "newest", label: "Newest" },
              { key: "oldest", label: "Oldest" },
              { key: "highest", label: "Highest Rated" },
              { key: "lowest", label: "Lowest Rated" },
              { key: "mostHelpful", label: "Most Helpful" },
            ].map((sort) => (
              <button
                key={sort.key}
                onClick={() => handleSortChange(sort.key as SortOption)}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  activeSort === sort.key
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
                }`}
              >
                {sort.label}
                {activeSort === sort.key && <ArrowUpDown className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="flex flex-col gap-4">
        {isLoadingMore && filteredReviews.length === 0 ? (
          /* Loading state during tab switch (not initial load) */
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 rounded-lg bg-white/5 p-4">
                <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/3 p-8 text-center">
            <p className="text-sm text-gray-400">
              {activeTab === "direct"
                ? "No direct reviews yet."
                : activeTab === "event"
                  ? "No event reviews yet."
                  : activeTab === "gig"
                    ? "No gig reviews yet."
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
          filteredReviews.map((r, idx) => {
            const primaryRole = getPrimaryRole(r.user.roles);
            const isGigReview = r.reviewType === "GIG_ORGANIZER" || !!r.gig;
            return (
              <Card
                key={`${r.id}-${r.reviewType ?? "direct"}-${r.event?.id ?? r.gig?.id ?? "none"}-${idx}`}
                className="bg-h_blackLight/30 gap-0 border-white/5 p-5"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-9 shrink-0 ring-1 ring-white/10">
                    {r.user.image && r.user.image.length > 0 ? (
                      <AvatarImage src={r.user.image} alt={r.user.name} />
                    ) : null}
                    <AvatarFallback className="bg-h_blackLight text-xs text-white">
                      {(r.user.name || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {r.user.name}
                        </span>
                        <Stars rating={r.rating} />
                        {/* User role badge - hidden for gig reviews (issue #3) */}
                        {primaryRole && !isGigReview && (
                          <span
                            className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                              ROLE_BADGE_CLASSES[primaryRole] ??
                              "border-white/10 bg-white/5 text-zinc-400"
                            }`}
                          >
                            {ROLE_LABELS[primaryRole] ?? primaryRole}
                          </span>
                        )}
                        {/* Review type badge - show for non-direct reviews */}
                        {r.reviewType && r.reviewType !== "DIRECT" && (
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
                        <span className="text-xs text-gray-400">{r.date}</span>
                        <DjRatingHelpfulButton
                          ratingId={r.id}
                          initialHelpfulCount={r.helpfulCount ?? 0}
                        />
                        <ReportButton
                          targetType="REVIEW"
                          targetId={String(r.id)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-white"
                        />
                      </div>
                    </div>

                    {/* Event context badge for event-anchored reviews */}
                    {r.event && (
                      <Link
                        href={`/events/${r.event.slug}`}
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/3 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
                      >
                        <Calendar className="h-3 w-3 shrink-0 text-gray-400" />
                        <span className="truncate">{r.event.title}</span>
                        <span className="text-gray-400">·</span>
                        <span className="shrink-0 text-gray-400">
                          {r.event.startDate}
                        </span>
                      </Link>
                    )}

                    {/* Gig context badge for gig reviews */}
                    {r.gig && (
                      <Link
                        href={
                          r.gig.slug
                            ? `/gigs/${r.gig.slug}`
                            : `/gigs/${r.gig.id}`
                        }
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/3 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
                      >
                        <Briefcase className="h-3 w-3 shrink-0 text-gray-400" />
                        <span className="truncate">{r.gig.title}</span>
                      </Link>
                    )}

                    {/* Review content - only show if there's actual text */}
                    {r.review && r.review.trim().length > 0 && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-300">
                        {r.review}
                      </p>
                    )}

                    {/* DJ response */}
                    {(r.response || isOwner) && (
                      <DjRatingResponse
                        ratingId={r.id}
                        djProfileId={r.djProfileId ?? djProfileId ?? 0}
                        existingResponse={r.response}
                        respondedAt={
                          r.respondedAt ? new Date(r.respondedAt) : undefined
                        }
                        djName={djName}
                      />
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More button - only show when 6+ filtered reviews displayed and more exist */}
      {onLoadMore && hasNextPage && filteredReviews.length >= 6 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10"
          >
            {isLoadingMore ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </section>
  );
}
