import prisma from "@/lib/client";
import { updateOrganizerReputationScore } from "@/lib/reputation/organizer-update";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email/send";
import type { DjReviewData } from "@/lib/email/types";
import { cacheDelete } from "@/lib/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djscovery.com";

export interface DjGigReviewPostSubmitEffectsInput {
  reviewId: number;
  created: boolean;
  rating: number;
  trimmedReview: string;
  gigId: number;
  gigSlug: string;
  gigTitle: string;
  organizerProfileId: number;
  organizerUserId: string;
  djProfileId: number;
  djProfileSlug: string;
  djStageName: string;
  reviewerId: string;
}

export async function runDjGigReviewPostSubmitEffects(
  input: DjGigReviewPostSubmitEffectsInput,
) {
  const {
    rating,
    trimmedReview,
    gigId,
    gigSlug,
    gigTitle,
    organizerProfileId,
    organizerUserId,
    djProfileSlug,
    djStageName,
    reviewerId,
  } = input;

  // Update organizer reputation score
  await updateOrganizerReputationScore(
    organizerProfileId,
    "ORGANIZER_REVIEW_ADDED" as const,
  ).catch((e) => console.error("Organizer reputation update failed:", e));

  // Invalidate cache entries for organizer profile
  await cacheDelete(`organizer_reviews:${organizerProfileId}:1:10:all`).catch(
    () => {},
  );

  if (input.created) {
    try {
      await prisma.notification.create({
        data: {
          type: "NEW_RATING",
          recipientId: organizerUserId,
          data: {
            gigId,
            gigTitle,
            rating,
            reviewerName: djStageName,
            reviewType: "dj",
          },
        },
      });
    } catch (notifError) {
      console.error("Failed to create DJ gig review notification:", notifError);
    }

    try {
      const [organizerUser, reviewer] = await Promise.all([
        prisma.user.findUnique({
          where: { id: organizerUserId },
          select: { email: true, name: true },
        }),
        prisma.user.findUnique({
          where: { id: reviewerId },
          select: { name: true },
        }),
      ]);

      if (organizerUser?.email) {
        const emailData: DjReviewData = {
          djName: organizerUser.name || "Organizer",
          reviewerName: reviewer?.name || djStageName,
          rating,
          comment: trimmedReview,
          eventTitle: gigTitle,
          reviewUrl: `${SITE_URL}/gigs/${gigSlug}`,
        };
        await sendEmail(organizerUser.email, "DJ_REVIEW", emailData);
      }
    } catch (emailError) {
      console.error("Failed to send DJ gig review email:", emailError);
    }
  }

  // Revalidate relevant paths
  revalidatePath(`/gigs/${gigSlug}`);
  revalidatePath(`/gigs/${gigSlug}/dj-review`);
  revalidatePath("/organizer/dashboard");
  revalidatePath(`/djs/${djProfileSlug}`);
}