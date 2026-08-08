"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createDjRating } from "@/lib/actions/dj-ratings";

const MIN_REVIEW_LENGTH = 30;
const MAX_REVIEW_LENGTH = 2000;

export interface DjRatingFormProps {
  /** DJ profile ID being reviewed */
  djProfileId: number;
  /** DJ display name */
  djName: string;
  /** DJ avatar URL (optional) */
  djAvatar?: string | null;
  /** DJ profile slug (for linking) */
  djSlug?: string;

  /**
   * Event context for event-anchored reviews.
   * When provided, the review is anchored to this event.
   * When omitted/null, the review is a direct review.
   */
  eventId?: number | null;
  eventTitle?: string;
  eventSlug?: string;
  eventStartDate?: Date | string;
  eventCity?: string;

  /**
   * Whether the reviewer is an organizer (affects placeholder text).
   * If not provided, the form uses a generic placeholder.
   */
  isOrganizer?: boolean;

  /** Called when the review is successfully submitted */
  onSuccess?: (created: boolean) => void;
  /** Called when the user cancels */
  onCancel?: () => void;
}

export function DjRatingForm({
  djProfileId,
  djName,
  djAvatar,
  djSlug,
  eventId,
  eventTitle,
  eventSlug,
  eventStartDate,
  eventCity,
  isOrganizer = false,
  onSuccess,
  onCancel,
}: DjRatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeRating = hoverRating || rating;
  const isEventReview = eventId != null && eventId > 0;
  const trimmedLength = review.trim().length;

  function handleSubmit() {
    setError(null);

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }
    if (trimmedLength < MIN_REVIEW_LENGTH) {
      setError(`Review must be at least ${MIN_REVIEW_LENGTH} characters.`);
      return;
    }
    if (trimmedLength > MAX_REVIEW_LENGTH) {
      setError(`Review must be at most ${MAX_REVIEW_LENGTH} characters.`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await createDjRating({
          djProfileId,
          rating,
          review: review.trim(),
          eventId: isEventReview ? eventId : null,
        });

        if (!result.success) {
          setError(result.error);
          return;
        }

        // Reset form
        setRating(0);
        setReview("");
        onSuccess?.(result.data.created);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  const placeholder = isEventReview
    ? isOrganizer
      ? `How was DJ. ${djName}'s professionalism, punctuality, and communication at "${eventTitle}"?`
      : `How was DJ. ${djName}'s performance and music selection at "${eventTitle}"?`
    : `Share your experience with DJ. ${djName}. How was their performance, music selection, and professionalism?`;

  return (
    <div className="flex flex-col gap-5">
      {/* DJ + Event context header */}
      <div className="flex items-center gap-3">
        <DjAvatar djName={djName} djAvatar={djAvatar} />
        <div className="min-w-0 flex-1">
          {djSlug ? (
            <Link
              href={`/djs/${djSlug}`}
              className="text-sm font-semibold text-white hover:underline"
            >
              DJ. {djName}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-white">DJ. {djName}</p>
          )}
          {isEventReview && eventTitle ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
              <Calendar className="h-3 w-3 shrink-0" />
              {eventSlug ? (
                <Link
                  href={`/events/${eventSlug}`}
                  className="truncate hover:text-zinc-300 hover:underline"
                >
                  {eventTitle}
                </Link>
              ) : (
                <span className="truncate">{eventTitle}</span>
              )}
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-zinc-400">Direct review</p>
          )}
          {isEventReview && eventCity && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-600">
              <MapPin className="h-3 w-3 shrink-0" />
              {eventCity}
            </div>
          )}
        </div>
      </div>

      {/* Star rating */}
      <div>
        <p className="mb-2 text-xs font-medium text-zinc-400">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isPending}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus-visible:ring-h_red rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= activeRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-700 hover:text-zinc-400"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs text-zinc-400">
            {activeRating > 0 ? `${activeRating} / 5` : "Select a rating"}
          </span>
        </div>
      </div>

      {/* Review text */}
      <div>
        <p className="mb-2 text-xs font-medium text-zinc-400">
          Your review
        </p>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={placeholder}
          disabled={isPending}
          maxLength={MAX_REVIEW_LENGTH}
          className="focus-visible:ring-h_red min-h-28 resize-none border-zinc-700 bg-zinc-950 text-sm text-white placeholder:text-zinc-600"
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            {trimmedLength < MIN_REVIEW_LENGTH
              ? `${MIN_REVIEW_LENGTH - trimmedLength} more characters needed`
              : `${trimmedLength}/${MAX_REVIEW_LENGTH}`}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
            className="text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isPending || rating === 0}
          className="bg-h_red hover:bg-h_redDark text-white"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}

function DjAvatar({
  djName,
  djAvatar,
}: {
  djName: string;
  djAvatar?: string | null;
}) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-800">
      {djAvatar ? (
        <Image src={djAvatar} alt={djName} fill className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-400">
          {djName.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
