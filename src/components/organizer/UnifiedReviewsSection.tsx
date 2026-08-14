"use client";

import { useState, useMemo } from "react";
import { Star, MessageSquare, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportButton } from "@/components/reporting/ReportButton";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FilterType = "all" | "organizer" | "dj";

interface OrganizerReviewItem {
  id: number;
  type: "organizer";
  communication: number;
  payment: number;
  professionalism: number;
  venueQuality: number;
  rating: number;
  review: string | null;
  createdAt: Date;
  djProfile: {
    slug: string;
    stageName: string;
    avatar: string | null;
    status: string;
    city: { name: string } | null;
    country: { name: string } | null;
  };
}

interface DjGigReviewItem {
  id: number;
  type: "dj";
  rating: number;
  review: string | null;
  createdAt: Date;
  djProfile: {
    id: number;
    stageName: string;
    slug: string;
    avatar: string | null;
  };
  gig: {
    id: number;
    title: string;
    slug: string;
  };
}

type UnifiedReview = OrganizerReviewItem | DjGigReviewItem;

interface UnifiedReviewsSectionProps {
  organizerReviews: OrganizerReviewItem[];
  djGigReviews: DjGigReviewItem[];
  avgRating: number;
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-gray-600",
          )}
        />
      ))}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function UnifiedReviewsSection({
  organizerReviews,
  djGigReviews,
  avgRating,
}: UnifiedReviewsSectionProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const allReviews = useMemo<UnifiedReview[]>(() => {
    const organizer: OrganizerReviewItem[] = organizerReviews.map((r) => ({
      ...r,
      type: "organizer" as const,
    }));
    const dj: DjGigReviewItem[] = djGigReviews.map((r) => ({
      ...r,
      type: "dj" as const,
    }));
    const combined = [...organizer, ...dj];
    combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return combined;
  }, [organizerReviews, djGigReviews]);

  const filteredReviews = useMemo(() => {
    if (filter === "all") return allReviews;
    return allReviews.filter((r) => r.type === filter);
  }, [allReviews, filter]);

  const totalReviews = allReviews.length;
  const organizerCount = organizerReviews.length;
  const djCount = djGigReviews.length;

  // Combined rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = allReviews.filter((r) => r.rating === stars).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, pct };
  });

  const filters: {
    id: FilterType;
    label: string;
    count: number;
    icon: React.ElementType;
  }[] = [
    {
      id: "all",
      label: "All Reviews",
      count: totalReviews,
      icon: MessageSquare,
    },
    {
      id: "organizer",
      label: "Organizer Reviews",
      count: organizerCount,
      icon: Star,
    },
    { id: "dj", label: "DJ Reviews", count: djCount, icon: Music },
  ];

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-white">Reviews & Ratings</h2>

      {/* Rating summary card */}
      <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-white/8 bg-linear-to-br from-white/5 to-transparent p-6 sm:flex-row">
        {/* Overall score */}
        <div className="flex min-w-32 shrink-0 flex-col items-center justify-center gap-2">
          <span className="text-5xl leading-none font-bold text-white">
            {avgRating.toFixed(1)}
          </span>
          <StarRating rating={avgRating} size="md" />
          <span className="text-xs text-gray-400">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Distribution */}
        <div className="flex flex-1 flex-col justify-center gap-2">
          {ratingDistribution.map(({ stars, count, pct }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="w-3 text-right text-xs text-gray-400">
                {stars}
              </span>
              <Star className="h-3 w-3 shrink-0 text-amber-400" />
              <Progress value={pct} className="h-1.5 flex-1 bg-white/8" />
              <span className="w-8 text-right text-xs text-gray-400">
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* Review type breakdown */}
        <div className="flex shrink-0 flex-col justify-center gap-3 border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Breakdown
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-sm text-gray-300">
              {organizerCount} Organizer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="text-h_redLight h-3.5 w-3.5" />
            <span className="text-sm text-gray-300">{djCount} DJ</span>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-h_red bg-h_red/15 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  isActive
                    ? "bg-h_red/30 text-white"
                    : "bg-white/10 text-gray-400",
                )}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reviews list */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-700" />
          <p className="text-sm text-gray-400">
            No {filter !== "all" ? filter + " " : ""}reviews yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={`${review.type}-${review.id}`} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: UnifiedReview }) {
  if (review.type === "organizer") {
    return <OrganizerReviewCard review={review} />;
  }
  return <DjReviewCard review={review} />;
}

function OrganizerReviewCard({ review }: { review: OrganizerReviewItem }) {
  return (
    <Card className="border-white/8 bg-white/3 p-5">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0 ring-1 ring-white/10">
          <AvatarImage src={review.djProfile.avatar || undefined} />
          <AvatarFallback className="bg-white/10 text-xs text-white">
            {review.djProfile.stageName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/djs/${review.djProfile.slug}`}
                className="text-sm font-medium text-white hover:text-gray-300"
              >
                {review.djProfile.stageName}
              </Link>
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-300">
                Organizer Review
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {formatDate(review.createdAt)}
              </span>
              <ReportButton
                targetType="REVIEW"
                targetId={String(review.id)}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-white"
              />
            </div>
          </div>

          <div className="mt-2">
            <StarRating rating={review.rating} />
          </div>

          {/* Category Breakdown */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className="text-gray-400">
              Communication:{" "}
              <span className="text-gray-300">{review.communication}/5</span>
            </span>
            <span className="text-gray-400">
              Payment: <span className="text-gray-300">{review.payment}/5</span>
            </span>
            <span className="text-gray-400">
              Professionalism:{" "}
              <span className="text-gray-300">{review.professionalism}/5</span>
            </span>
            <span className="text-gray-400">
              Venue:{" "}
              <span className="text-gray-300">{review.venueQuality}/5</span>
            </span>
          </div>

          {review.review && (
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              {review.review}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function DjReviewCard({ review }: { review: DjGigReviewItem }) {
  return (
    <Card className="border-white/8 bg-white/3 p-5">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0 ring-1 ring-white/10">
          <AvatarImage src={review.djProfile.avatar || undefined} />
          <AvatarFallback className="bg-white/10 text-xs text-white">
            {review.djProfile.stageName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/djs/${review.djProfile.slug}`}
                className="text-sm font-medium text-white hover:text-gray-300"
              >
                {review.djProfile.stageName}
              </Link>
              <span className="bg-h_red/15 text-h_redLight rounded-full px-2 py-0.5 text-xs font-medium">
                DJ Review
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <div className="mt-2">
            <StarRating rating={review.rating} />
          </div>

          {/* Gig link */}
          <Link
            href={`/gigs/${review.gig.slug}`}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
          >
            <Music className="h-3 w-3" />
            {review.gig.title}
          </Link>

          {review.review && (
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              {review.review}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
