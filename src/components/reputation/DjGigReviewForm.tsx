"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createDjGigReview } from "@/lib/actions/dj-gig-reviews";

export function DjGigReviewForm({
  gigId,
  djProfileId,
  organizerName,
  gigTitle,
}: {
  gigId: number;
  djProfileId: number;
  organizerName: string;
  gigTitle?: string;
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
        await createDjGigReview({
          gigId,
          djProfileId,
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

  if (success) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="py-5">
          <p className="text-sm font-medium text-green-300">
            Thanks! Your review has been submitted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/8 bg-white/3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-white">
          Rate your experience with {organizerName}
        </CardTitle>
        {gigTitle && (
          <p className="text-xs text-gray-400">
            How was your experience working with{" "}
            <strong className="text-gray-300">{organizerName}</strong> for{" "}
            <strong className="text-gray-300">{gigTitle}</strong>?
          </p>
        )}
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
                    : "text-gray-400"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs text-gray-400">
            {activeRating > 0 ? `${activeRating} / 5` : "Select a rating"}
          </span>
        </div>

        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell us about the organizer's professionalism, communication, payment reliability, and overall experience..."
          disabled={isPending}
          className="focus-visible:ring-h_red min-h-25 border-white/10 bg-black/30 text-sm text-white placeholder:text-gray-400"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
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
