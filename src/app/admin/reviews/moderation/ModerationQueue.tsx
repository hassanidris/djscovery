"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_COLORS = {
  low: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  high: "border-red-500/30 bg-red-500/10 text-red-400",
};

const FACTOR_LABELS: Record<string, string> = {
  extreme_rating: "Extreme Rating",
  perfect_score_spam: "Perfect Score Spam",
  rating_outlier: "Rating Outlier",
  repeat_content: "Repeat Content",
  short_generic: "Short Generic",
  excessive_caps: "Excessive Caps",
  excessive_punctuation: "Excessive Punctuation",
  rapid_submission: "Rapid Submission",
  burst_pattern: "Burst Pattern",
  new_account: "New Account",
  single_review_user: "Single Review User",
  low_activity_user: "Low Activity User",
};

interface ModerationQueueProps {
  queue: any[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export default function ModerationQueue({
  queue,
  selectedIds,
  onSelectionChange,
}: ModerationQueueProps) {
  const handleToggle = (id: number) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelected);
  };

  return (
    <div className="space-y-4">
      {queue.map((item) => (
        <div
          key={item.reviewId}
          className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
        >
          <Checkbox
            checked={selectedIds.includes(item.reviewId)}
            onCheckedChange={() => handleToggle(item.reviewId)}
            className="mt-1"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    className={
                      SEVERITY_COLORS[
                        item.suspiciousFactors
                          .severity as keyof typeof SEVERITY_COLORS
                      ] || "border-gray-500/30 bg-gray-500/10 text-gray-400"
                    }
                  >
                    {item.suspiciousFactors.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    Score: {item.suspiciousFactors.score}
                  </span>
                  <span className="text-sm text-gray-400">
                    Priority: {item.priority}
                  </span>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium text-white">
                    {item.rating} stars
                  </span>
                  {item.review && (
                    <p className="line-clamp-2 text-sm text-gray-300">
                      {item.review}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.suspiciousFactors.factors.map((factor: string) => (
                    <Badge
                      key={factor}
                      variant="outline"
                      className="border-white/10 bg-white/5 text-xs text-gray-400"
                    >
                      {FACTOR_LABELS[factor] || factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="ml-4 text-right">
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <a
                  href={`/admin/reviews/${item.reviewId}`}
                  className="mt-2 inline-block text-xs text-gray-400 transition-colors hover:text-white"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
