"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createEventReview } from "@/lib/actions/event-reviews";

export function EventReviewForm({
  eventId,
  djProfileId,
  djName,
  djAvatar,
  alreadyReviewed,
  isOrganizer = false,
}: {
  eventId: number;
  djProfileId: number;
  djName: string;
  djAvatar?: string | null;
  alreadyReviewed?: boolean;
  isOrganizer?: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeRating = hoverRating || rating;

  function handleSubmit() {
    setError(null);
    setSuccess(false);

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }
    if (review.trim().length < 30) {
      setError("Review must be at least 30 characters.");
      return;
    }

    startTransition(async () => {
      try {
        await createEventReview(eventId, djProfileId, {
          rating,
          review: review.trim(),
        });
        setSuccess(true);
        setRating(0);
        setReview("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  if (alreadyReviewed || success) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="flex items-center gap-3 py-4">
          <DjAvatar djName={djName} djAvatar={djAvatar} />
          <p className="text-sm font-medium text-green-300">
            {alreadyReviewed ? "Reviewed" : "Thanks!"} — DJ. {djName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <DjAvatar djName={djName} djAvatar={djAvatar} />
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold text-white">
              DJ. {djName}
            </CardTitle>
            <p className="text-xs text-zinc-500">
              {isOrganizer ? "As the event organizer" : "As an attendee"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
                className={`h-6 w-6 ${
                  star <= activeRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-600"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs text-zinc-500">
            {activeRating > 0 ? `${activeRating} / 5` : "Select a rating"}
          </span>
        </div>

        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={
            isOrganizer
              ? `How was DJ. ${djName}'s professionalism, punctuality, and communication?`
              : `How was DJ. ${djName}'s performance and music selection at this event?`
          }
          disabled={isPending}
          className="focus-visible:ring-h_red min-h-24 border-zinc-700 bg-zinc-950 text-sm text-white placeholder:text-zinc-600"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            {review.trim().length}/30 characters minimum
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-h_red hover:bg-h_redDark text-white"
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800">
      {djAvatar ? (
        <Image src={djAvatar} alt={djName} fill className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-400">
          {djName.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
