"use client";

import { useState, useEffect, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleDjRatingHelpful,
  hasUserVotedHelpful,
} from "@/lib/actions/dj-rating-helpfulness";
import { useUser } from "@/lib/supabase/useUser";

interface DjRatingHelpfulButtonProps {
  ratingId: number;
  initialHelpfulCount: number;
  onVoteChange?: (isHelpful: boolean, newCount: number) => void;
}

export function DjRatingHelpfulButton({
  ratingId,
  initialHelpfulCount,
  onVoteChange,
}: DjRatingHelpfulButtonProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [isPending, startTransition] = useTransition();
  const { user, isLoaded } = useUser();

  // Check if user has already voted
  useEffect(() => {
    if (isLoaded && user) {
      hasUserVotedHelpful(ratingId).then(setIsHelpful);
    }
  }, [ratingId, isLoaded, user]);

  function handleToggle() {
    if (!user) {
      // Could trigger sign-in modal here
      return;
    }

    startTransition(async () => {
      const result = await toggleDjRatingHelpful(ratingId);

      if (result.success) {
        setIsHelpful(result.data.isHelpful);
        setHelpfulCount(result.data.helpfulCount);
        onVoteChange?.(result.data.isHelpful, result.data.helpfulCount);
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending || !user}
      className={`flex items-center gap-1.5 text-xs ${
        isHelpful
          ? "text-emerald-400 hover:text-emerald-300"
          : "text-gray-400 hover:text-gray-300"
      }`}
    >
      <ThumbsUp className={`h-3.5 w-3.5 ${isHelpful ? "fill-current" : ""}`} />
      <span>{helpfulCount}</span>
      <span className="hidden sm:inline">
        {isHelpful ? "Helpful" : "Mark helpful"}
      </span>
    </Button>
  );
}
