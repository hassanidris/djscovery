"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createOrganizerReview } from "@/lib/actions/organizer-reviews";

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function RatingInput({ label, value, onChange, disabled }: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const activeRating = hoverRating || value;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onChange(star)}
            className="focus-visible:ring-h_red rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label={`Rate ${label} ${star} stars`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= activeRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-600"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-zinc-500">
          {activeRating > 0 ? `${activeRating} / 5` : "Select rating"}
        </span>
      </div>
    </div>
  );
}

export function OrganizerReviewForm({
  gigId,
  organizerProfileId,
  organizerName,
  gigTitle,
}: {
  gigId: number;
  organizerProfileId: number;
  organizerName: string;
  gigTitle?: string;
}) {
  const [communication, setCommunication] = useState(0);
  const [payment, setPayment] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [venueQuality, setVenueQuality] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allRatingsSet =
    communication > 0 && payment > 0 && professionalism > 0 && venueQuality > 0;

  function handleSubmit() {
    setError(null);
    setSuccess(false);

    if (!allRatingsSet) {
      setError("Please provide ratings for all categories.");
      return;
    }
    if (review.trim().length < 30) {
      setError("Review must be at least 30 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createOrganizerReview(gigId, organizerProfileId, {
          communication,
          payment,
          professionalism,
          venueQuality,
          review: review.trim(),
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setSuccess(true);
        setCommunication(0);
        setPayment(0);
        setProfessionalism(0);
        setVenueQuality(0);
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
          <p className="text-xs text-gray-500">
            How was your experience with{" "}
            <strong className="text-gray-300">{organizerName}</strong> for{" "}
            <strong className="text-gray-300">{gigTitle}</strong>?
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <RatingInput
            label="Communication"
            value={communication}
            onChange={setCommunication}
            disabled={isPending}
          />
          <RatingInput
            label="Payment"
            value={payment}
            onChange={setPayment}
            disabled={isPending}
          />
          <RatingInput
            label="Professionalism"
            value={professionalism}
            onChange={setProfessionalism}
            disabled={isPending}
          />
          <RatingInput
            label="Venue Quality"
            value={venueQuality}
            onChange={setVenueQuality}
            disabled={isPending}
          />
        </div>

        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell us about the organizer's communication, payment process, professionalism, and venue quality..."
          disabled={isPending}
          className="focus-visible:ring-h_red min-h-28 border-white/10 bg-black/30 text-sm text-white placeholder:text-gray-600"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {review.trim().length}/30 characters minimum
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !allRatingsSet}
            className="bg-h_red hover:bg-h_redDark text-white"
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
