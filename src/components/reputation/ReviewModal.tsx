"use client";

import { useState, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DjRatingForm } from "./DjRatingForm";

export interface ReviewModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;

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

  /** Whether the reviewer is an organizer */
  isOrganizer?: boolean;
}

/**
 * Modal dialog for submitting a DjRating (direct or event-anchored).
 *
 * Uses the shadcn/ui Dialog (Radix UI under the hood) which provides:
 *   - Focus trapping
 *   - Keyboard navigation (Esc to close, Tab cycling)
 *   - Backdrop click to close
 *   - Screen reader announcements
 *   - Animated open/close transitions
 *
 * The modal shows a success state after submission, then auto-closes.
 */
export function ReviewModal({
  isOpen,
  onClose,
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
}: ReviewModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = useCallback((created: boolean) => {
    setShowSuccess(true);
    // Auto-close after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  }, [onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setShowSuccess(false);
        onClose();
      }
    },
    [onClose],
  );

  const isEventReview = eventId != null && eventId > 0;
  const title = isEventReview
    ? `Review DJ. ${djName}`
    : `Review DJ. ${djName}`;
  const description = isEventReview
    ? `Share your experience from "${eventTitle}"`
    : "Share your experience with this DJ";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-black text-white sm:max-w-lg">
        {showSuccess ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                Review Submitted
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Thank you for reviewing DJ. {djName}. Your feedback helps the
                community.
              </DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                {description}
              </DialogDescription>
            </DialogHeader>
            <DjRatingForm
              djProfileId={djProfileId}
              djName={djName}
              djAvatar={djAvatar}
              djSlug={djSlug}
              eventId={eventId}
              eventTitle={eventTitle}
              eventSlug={eventSlug}
              eventStartDate={eventStartDate}
              eventCity={eventCity}
              isOrganizer={isOrganizer}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
