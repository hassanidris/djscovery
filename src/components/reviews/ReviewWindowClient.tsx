"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2 } from "lucide-react";
import { DjRatingForm } from "@/components/reputation/DjRatingForm";

interface Dj {
  id: number;
  stageName: string;
  slug: string;
  avatar: string | null;
}

interface ExistingReview {
  djProfileId: number;
  rating: number;
  review: string | null;
}

interface Event {
  id: number;
  title: string;
  slug: string;
}

interface ReviewWindowClientProps {
  completedAt: string | null; // ISO string or null
  event: Event;
  allDjs: Array<{
    id: number;
    stageName: string;
    slug: string;
    avatar: string | null;
  }>;
  existingReviews: ExistingReview[];
}

export default function ReviewWindowClient({
  completedAt,
  event,
  allDjs,
  existingReviews,
}: ReviewWindowClientProps) {
  const reviewedDjIds = new Set(existingReviews.map((r) => r.djProfileId));
  const reviewableDjs = allDjs.filter((dj) => !reviewedDjIds.has(dj.id));

  // If no completedAt, treat review window as open
  let reviewWindowOpen = true;
  let daysRemaining: number | null = null;

  if (completedAt) {
    const now = Date.now();
    const deadline = new Date(
      new Date(completedAt).getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    reviewWindowOpen = now <= deadline.getTime();
    daysRemaining = Math.max(
      0,
      Math.ceil((deadline.getTime() - now) / (1000 * 60 * 60 * 24)),
    );
  }

  return (
    <>
      {!reviewWindowOpen && (
        <Card className="border-gray-500/20 bg-gray-500/5">
          <CardContent className="py-5">
            <p className="text-sm text-gray-300">
              The review window has expired.
            </p>
          </CardContent>
        </Card>
      )}

      {reviewWindowOpen && reviewableDjs.length === 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="py-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-300">
                  You have reviewed all DJs from this event.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviewWindowOpen && daysRemaining !== null && daysRemaining <= 7 && (
        <div className="mb-4 flex items-center gap-2 text-xs text-amber-400">
          <Clock className="h-3.5 w-3.5" />
          {daysRemaining} days left to review
        </div>
      )}

      {reviewWindowOpen && reviewableDjs.length > 0 && (
        <div className="space-y-6">
          {reviewableDjs.map((dj) => (
            <Card key={dj.id} className="border-white/10 bg-zinc-900/50">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    {dj.avatar ? (
                      <img
                        src={dj.avatar}
                        alt={dj.stageName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-sm font-bold text-zinc-400">
                        {dj.stageName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <a
                      href={`/djs/${dj.slug}`}
                      className="text-base font-medium text-white hover:underline"
                    >
                      DJ. {dj.stageName}
                    </a>
                    <p className="text-xs text-gray-400">
                      Performer at {event.title}
                    </p>
                  </div>
                </div>
                <DjRatingForm
                  djProfileId={dj.id}
                  djName={dj.stageName}
                  eventId={event.id}
                  eventTitle={event.title}
                  eventSlug={event.slug}
                  isOrganizer={false}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {existingReviews.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-400">
            Your Reviews
          </h2>
          <div className="space-y-3">
            {existingReviews.map((review) => {
              const dj = allDjs.find((d) => d.id === review.djProfileId);
              if (!dj) return null;
              return (
                <Card
                  key={review.djProfileId}
                  className="border-white/5 bg-zinc-900/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                        {dj.avatar ? (
                          <img
                            src={dj.avatar}
                            alt={dj.stageName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">
                            {dj.stageName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          DJ. {dj.stageName}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-400"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {review.review && (
                          <p className="mt-2 text-sm text-gray-300">
                            {review.review}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
