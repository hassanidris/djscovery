import prisma from "@/lib/client";
import { updateReputationScore } from "@/lib/reputation/update";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/send";
import type { DjReviewData } from "@/lib/email/types";
import { cacheDelete } from "@/lib/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djscovery.com";

export interface PostSubmitEffectsInput {
  ratingId: number;
  created: boolean;
  rating: number;
  trimmedReview: string;
  isEventReview: boolean;
  eventId: number | null;
  djProfileId: number;
  djProfileSlug: string;
  djProfileUserId: string;
  djStageName: string;
  reviewerId: string;
  eventSlug: string | null;
  eventTitle: string | null;
}

/**
 * Shared post-submit side effects used by both the server action and API route:
 *   - Reputation score update
 *   - Cache invalidation
 *   - Notification creation
 *   - Email sending
 *   - Path revalidation
 */
export async function runPostSubmitEffects(input: PostSubmitEffectsInput) {
  const {
    rating,
    trimmedReview,
    isEventReview,
    eventId,
    djProfileId,
    djProfileSlug,
    djProfileUserId,
    djStageName,
    reviewerId,
    eventSlug,
    eventTitle,
  } = input;

  // --- Reputation ---
  await updateReputationScore(djProfileId, "EVENT_REVIEW_ADDED" as const).catch(
    (e) => console.error("Reputation update failed:", e),
  );

  // --- Cache invalidation ---
  for (const filterKey of ["all", "direct", `event:${eventId ?? ""}`]) {
    await cacheDelete(`dj_ratings:${djProfileSlug}:1:10:${filterKey}`).catch(
      () => {},
    );
  }

  // --- Notification ---
  try {
    await prisma.notification.create({
      data: {
        type: "NEW_RATING",
        recipientId: djProfileUserId,
        data: {
          rating,
          reviewerType: isEventReview ? "event" : "direct",
          ...(isEventReview && eventId ? { eventId, eventTitle } : {}),
        },
      },
    });
  } catch (notifError) {
    console.error("Failed to create rating notification:", notifError);
  }

  // --- Email ---
  try {
    const [djUser, reviewer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: djProfileUserId },
        select: { email: true },
      }),
      prisma.user.findUnique({
        where: { id: reviewerId },
        select: { name: true },
      }),
    ]);

    if (djUser?.email) {
      const emailData: DjReviewData = {
        djName: djStageName,
        reviewerName: reviewer?.name || "Someone",
        rating,
        comment: trimmedReview,
        eventTitle: eventTitle ?? "",
        reviewUrl:
          isEventReview && eventSlug
            ? `${SITE_URL}/events/${eventSlug}`
            : `${SITE_URL}/djs/${djProfileSlug}`,
      };
      await sendEmail(djUser.email, "DJ_REVIEW", emailData);
    }
  } catch (emailError) {
    console.error("Failed to send review email:", emailError);
  }

  // --- Revalidate paths ---
  revalidatePath(`/djs/${djProfileSlug}`);
  if (isEventReview && eventSlug) {
    revalidatePath(`/events/${eventSlug}`);
  }
  revalidatePath("/fan/profile");
}
