"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  dismissReviewNotification,
  remindReviewNotification,
} from "@/lib/actions/review-notification-tracking";
import { Clock, X } from "lucide-react";

interface ReviewNotificationActionsProps {
  targetType: "EVENT" | "GIG";
  targetId: number;
  onDismiss?: () => void;
  onRemind?: () => void;
}

export function ReviewNotificationActions({
  targetType,
  targetId,
  onDismiss,
  onRemind,
}: ReviewNotificationActionsProps) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [isReminding, setIsReminding] = useState(false);

  const handleDismiss = async () => {
    setIsDismissing(true);
    const result = await dismissReviewNotification({ targetType, targetId });
    setIsDismissing(false);

    if (result.success) {
      onDismiss?.();
    }
  };

  const handleRemind = async () => {
    setIsReminding(true);
    const result = await remindReviewNotification({ targetType, targetId });
    setIsReminding(false);

    if (result.success) {
      onRemind?.();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemind}
        disabled={isReminding}
        className="h-8 text-xs text-gray-400 hover:text-white"
      >
        <Clock className="mr-1.5 h-3 w-3" />
        {isReminding ? "Setting..." : "Remind me later"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        disabled={isDismissing}
        className="h-8 text-xs text-gray-400 hover:text-white"
      >
        <X className="mr-1.5 h-3 w-3" />
        {isDismissing ? "Dismissing..." : "Dismiss"}
      </Button>
    </div>
  );
}
