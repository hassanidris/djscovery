import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, User, MessageSquare } from "lucide-react";
import {
  getAdminReviews,
  approveReview,
  hideReview,
  flagReview,
  deleteReview,
} from "@/lib/actions/admin-review-management";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Reviews" };

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
  DIRECT: "Direct",
  EVENT_ATTENDEE: "Event Attendee",
  EVENT_ORGANIZER: "Event Organizer",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const parsedCursor = params.cursor ? Number(params.cursor) : undefined;
  const cursor =
    parsedCursor !== undefined && Number.isFinite(parsedCursor)
      ? parsedCursor
      : undefined;
  const status = params.status;
  const reviewType = params.reviewType;
  const minRating = params.minRating ? Number(params.minRating) : undefined;
  const maxRating = params.maxRating ? Number(params.maxRating) : undefined;
  const startDate = params.startDate ? new Date(params.startDate) : undefined;
  const endDate = params.endDate ? new Date(params.endDate) : undefined;

  const { reviews, nextCursor } = await getAdminReviews({
    cursor,
    status,
    reviewType,
    minRating,
    maxRating,
    startDate,
    endDate,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage and moderate DJ reviews across the platform.
        </p>
      </div>

      <AdminFilters
        currentValues={{
          status: status ?? "",
          reviewType: reviewType ?? "",
          minRating: params.minRating ?? "",
          maxRating: params.maxRating ?? "",
          startDate: params.startDate ?? "",
          endDate: params.endDate ?? "",
        }}
        filters={[
          {
            key: "status",
            placeholder: "All Statuses",
            options: [
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "HIDDEN", label: "Hidden" },
              { value: "FLAGGED", label: "Flagged" },
            ],
          },
          {
            key: "reviewType",
            placeholder: "All Types",
            options: [
              { value: "DIRECT", label: "Direct" },
              { value: "EVENT_ATTENDEE", label: "Event Attendee" },
              { value: "EVENT_ORGANIZER", label: "Event Organizer" },
            ],
          },
        ]}
        dateRange={{
          startDateKey: "startDate",
          endDateKey: "endDate",
        }}
        ratingRange={{
          minKey: "minRating",
          maxKey: "maxRating",
        }}
      />

      <Suspense fallback={<AdminTableSkeleton cols={7} rows={8} />}>
        {reviews.length === 0 ? (
          <AdminEmptyState
            title="No reviews found"
            description={
              !status || status === "APPROVED"
                ? "No reviews match the current filter."
                : "No reviews match the current filter."
            }
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Reviewer
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        DJ
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Rating
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-400">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reviews.map((review) => (
                      <tr
                        key={review.id}
                        className="transition-colors hover:bg-white/2"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {review.user.image && (
                              <Image
                                src={review.user.image}
                                alt={review.user.username}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium text-white">
                                {review.user.name || review.user.username}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                @{review.user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/djs/${review.djProfile.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-h_redLight font-medium text-white transition-colors"
                          >
                            {review.djProfile.stageName}
                          </Link>
                          {review.event && (
                            <div className="text-muted-foreground mt-0.5 text-xs">
                              via{" "}
                              <Link
                                href={`/events/${review.event.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-gray-300"
                              >
                                {review.event.title}
                              </Link>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StarRating rating={review.rating} />
                          {review.helpfulCount > 0 && (
                            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                              <MessageSquare className="h-3 w-3" />
                              {review.helpfulCount} helpful
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="border border-white/10 bg-white/5 text-xs text-gray-300">
                            {review.reviewType
                              ? (REVIEW_TYPE_LABELS[review.reviewType] ??
                                review.reviewType)
                              : "Direct"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`text-xs ${
                              STATUS_COLORS[review.moderationStatus] ??
                              "border-gray-500/30 bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {STATUS_LABELS[review.moderationStatus] ??
                              review.moderationStatus}
                          </Badge>
                          {review.moderator && (
                            <div className="text-muted-foreground mt-1 text-xs">
                              by {review.moderator.username}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(review.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/reviews/${review.id}`}
                              className="text-xs text-gray-400 transition-colors hover:text-white"
                            >
                              View
                            </Link>
                            {review.moderationStatus !== "APPROVED" && (
                              <form action={approveReview}>
                                <input
                                  type="hidden"
                                  name="ratingId"
                                  value={review.id.toString()}
                                />
                                <button
                                  type="submit"
                                  className="inline-flex h-7 items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
                                >
                                  Approve
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
                                  className="inline-flex h-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                                >
                                  Hide
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
                                  className="inline-flex h-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                                >
                                  Flag
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
                                className="inline-flex h-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {nextCursor && (
              <div className="flex items-center justify-end gap-2 pt-4">
                <Link
                  href={(() => {
                    const newParams = new URLSearchParams(params);
                    newParams.delete("cursor");
                    return `/admin/reviews?${newParams.toString()}`;
                  })()}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  First
                </Link>
                <Link
                  href={(() => {
                    const newParams = new URLSearchParams(params);
                    newParams.set("cursor", nextCursor.toString());
                    return `/admin/reviews?${newParams.toString()}`;
                  })()}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}
