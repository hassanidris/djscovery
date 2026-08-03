"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createVenueReview } from "@/lib/actions/venue-reviews";

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

export function VenueReviewForm({
  eventId,
  venueId,
  venueName,
  eventTitle,
}: {
  eventId: number;
  venueId: number;
  venueName: string;
  eventTitle?: string;
}) {
  const [soundSystem, setSoundSystem] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);
  const [location, setLocation] = useState(0);
  const [accessibility, setAccessibility] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allRatingsSet =
    soundSystem > 0 && atmosphere > 0 && location > 0 && accessibility > 0;

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
        const result = await createVenueReview(eventId, venueId, {
          soundSystem,
          atmosphere,
          location,
          accessibility,
          review: review.trim(),
        });
        if (!result.success) {
          setError(result.error || "Something went wrong.");
          return;
        }
        setSuccess(true);
        setSoundSystem(0);
        setAtmosphere(0);
        setLocation(0);
        setAccessibility(0);
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
            Thanks! Your venue review has been submitted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/8 bg-white/3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-white">
          Rate your experience at {venueName}
        </CardTitle>
        {eventTitle && (
          <p className="text-xs text-gray-500">
            How was {venueName} for{" "}
            <strong className="text-gray-300">{eventTitle}</strong>?
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <RatingInput
            label="Sound System"
            value={soundSystem}
            onChange={setSoundSystem}
            disabled={isPending}
          />
          <RatingInput
            label="Atmosphere"
            value={atmosphere}
            onChange={setAtmosphere}
            disabled={isPending}
          />
          <RatingInput
            label="Location"
            value={location}
            onChange={setLocation}
            disabled={isPending}
          />
          <RatingInput
            label="Accessibility"
            value={accessibility}
            onChange={setAccessibility}
            disabled={isPending}
          />
        </div>

        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell us about the venue's sound quality, atmosphere, location convenience, and accessibility features..."
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
