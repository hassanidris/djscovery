import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, User, MessageSquare, ArrowLeft } from "lucide-react";
import {
  getAdminReviewById,
  approveReview,
  hideReview,
  flagReview,
  deleteReview,
} from "@/lib/actions/admin-review-management";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Review Details" };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  APPROVED: "border-green-500/30 bg-green-500/10 text-green-400",
  HIDDEN: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  FLAGGED: "border-red-500/30 bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  HIDDEN: "Hidden",
  FLAGGED: "Flagged",
};

const REVIEW_TYPE_LABELS: Record<string, string> = {
  DIRECT: "Direct Review",
  EVENT_ATTENDEE: "Event Attendee Review",
  EVENT_ORGANIZER: "Event Organizer Review",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = await params;
  const reviewIdNum = Number(reviewId);

  const result = await getAdminReviewById(reviewIdNum);

  if (!result.success || !result.data) {
    notFound();
  }

  const review = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/reviews"
            className="mb-2 inline-flex items-center text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reviews
          </Link>
          <h1 className="text-2xl font-bold text-white">Review Details</h1>
        </div>
        <Badge
          className={`${
            STATUS_COLORS[review.moderationStatus] ??
            "border-gray-500/30 bg-gray-500/10 text-gray-400"
          }`}
        >
          {STATUS_LABELS[review.moderationStatus] ?? review.moderationStatus}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-white/8 bg-white/2 p-6">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {review.user.image && (
                  <Image
                    src={review.user.image}
                    alt={review.user.username}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-medium text-white">
                    {review.user.name || review.user.username}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    @{review.user.username}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                {review.updatedAt > review.createdAt && (
                  <div className="text-muted-foreground mt-1 text-xs">
                    Updated{" "}
                    {formatDistanceToNow(new Date(review.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <StarRating rating={review.rating} />
            </div>

            {review.review && (
              <div className="mb-6 rounded-lg border border-white/5 bg-white/1 p-4">
                <p className="text-gray-300">{review.review}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              {review.helpfulCount > 0 && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  {review.helpfulCount} helpful vote
                  {review.helpfulCount !== 1 ? "s" : ""}
                </div>
              )}
              {review.reviewType && (
                <Badge className="border border-white/10 bg-white/5 text-xs text-gray-300">
                  {REVIEW_TYPE_LABELS[review.reviewType] ?? review.reviewType}
                </Badge>
              )}
            </div>
          </div>

          {review.response && (
            <div className="rounded-xl border border-white/8 bg-white/2 p-6">
              <h3 className="mb-4 font-semibold text-white">DJ Response</h3>
              <p className="text-gray-300">{review.response}</p>
              {review.respondedAt && (
                <div className="text-muted-foreground mt-4 text-sm">
                  Responded{" "}
                  {formatDistanceToNow(new Date(review.respondedAt), {
                    addSuffix: true,
                  })}
                </div>
              )}
            </div>
          )}

          {review.moderatorNote && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h3 className="mb-2 font-semibold text-amber-400">Admin Note</h3>
              <p className="text-gray-300">{review.moderatorNote}</p>
              {review.moderatedAt && review.moderator && (
                <div className="text-muted-foreground mt-4 text-sm">
                  Moderated by {review.moderator.username}{" "}
                  {formatDistanceToNow(new Date(review.moderatedAt), {
                    addSuffix: true,
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/8 bg-white/2 p-6">
            <h3 className="mb-4 font-semibold text-white">Subject</h3>
            <Link
              href={`/djs/${review.djProfile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/5"
            >
              {review.djProfile.avatar && (
                <Image
                  src={review.djProfile.avatar}
                  alt={review.djProfile.stageName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-medium text-white">
                  {review.djProfile.stageName}
                </div>
                <div className="text-muted-foreground text-xs">
                  View DJ Profile
                </div>
              </div>
            </Link>

            {review.event && (
              <div className="mt-4">
                <div className="text-muted-foreground mb-2 text-xs uppercase">
                  Event
                </div>
                <Link
                  href={`/events/${review.event.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg p-3 transition-colors hover:bg-white/5"
                >
                  <div className="font-medium text-white">
                    {review.event.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    View Event
                  </div>
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/8 bg-white/2 p-6">
            <h3 className="mb-4 font-semibold text-white">Actions</h3>
            <div className="space-y-3">
              {review.moderationStatus !== "APPROVED" && (
                <form action={approveReview}>
                  <input
                    type="hidden"
                    name="ratingId"
                    value={review.id.toString()}
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
                  >
                    Approve Review
                  </button>
                </form>
              )}
              {review.moderationStatus !== "HIDDEN" && (
                <form action={hideReview}>
                  <input
                    type="hidden"
                    name="ratingId"
                    value={review.id.toString()}
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                  >
                    Hide Review
                  </button>
                </form>
              )}
              {review.moderationStatus !== "FLAGGED" && (
                <form action={flagReview}>
                  <input
                    type="hidden"
                    name="ratingId"
                    value={review.id.toString()}
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Flag Review
                  </button>
                </form>
              )}
              <form action={deleteReview}>
                <input
                  type="hidden"
                  name="ratingId"
                  value={review.id.toString()}
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Delete Review
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/2 p-6">
            <h3 className="mb-4 font-semibold text-white">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Rating</span>
                <span className="font-medium text-white">
                  {review.rating}/5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Helpful Votes</span>
                <span className="font-medium text-white">
                  {review.helpfulCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Has Response</span>
                <span className="font-medium text-white">
                  {review.response ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="font-medium text-white">
                  {STATUS_LABELS[review.moderationStatus] ??
                    review.moderationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
