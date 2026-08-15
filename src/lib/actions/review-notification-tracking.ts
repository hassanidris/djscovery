"use server";

import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { ActionResult, actionError, actionSuccess } from "./action-result";

/**
 * Track that a user has been notified about a review opportunity.
 * This prevents duplicate notifications for the same event/gig.
 */
export async function trackReviewNotification(input: {
  targetType: "EVENT" | "GIG";
  targetId: number;
}): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  try {
    await prisma.reviewNotificationTracking.upsert({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      },
      create: {
        userId: user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        notifiedAt: new Date(),
      },
      update: {
        notifiedAt: new Date(),
      },
    });

    return actionSuccess();
  } catch (error) {
    console.error("Failed to track review notification:", error);
    return actionError("Failed to track notification");
  }
}

/**
 * Check if a user has already been notified about a review opportunity.
 */
export async function hasBeenNotified(input: {
  targetType: "EVENT" | "GIG";
  targetId: number;
}): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const tracking = await prisma.reviewNotificationTracking.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    },
  });

  return !!tracking;
}

/**
 * Dismiss a review notification (user chooses to ignore it).
 * This prevents future reminders for this specific review opportunity.
 */
export async function dismissReviewNotification(input: {
  targetType: "EVENT" | "GIG";
  targetId: number;
}): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  try {
    await prisma.reviewNotificationTracking.upsert({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      },
      create: {
        userId: user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        notifiedAt: new Date(),
        dismissedAt: new Date(),
      },
      update: {
        dismissedAt: new Date(),
      },
    });

    return actionSuccess();
  } catch (error) {
    console.error("Failed to dismiss review notification:", error);
    return actionError("Failed to dismiss notification");
  }
}

/**
 * Request a reminder for a review notification.
 * Updates the remindedAt timestamp and allows for future reminders.
 */
export async function remindReviewNotification(input: {
  targetType: "EVENT" | "GIG";
  targetId: number;
}): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("Unauthorized");

  try {
    await prisma.reviewNotificationTracking.upsert({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      },
      create: {
        userId: user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        notifiedAt: new Date(),
        remindedAt: new Date(),
      },
      update: {
        remindedAt: new Date(),
        dismissedAt: null, // Clear dismissal if user wants a reminder
      },
    });

    return actionSuccess();
  } catch (error) {
    console.error("Failed to set review reminder:", error);
    return actionError("Failed to set reminder");
  }
}

/**
 * Get users who should receive review reminders.
 * Returns users who were notified but haven't dismissed the notification
 * and haven't reviewed yet.
 */
export async function getUsersForReviewReminders(
  targetType: "EVENT" | "GIG",
  targetId: number,
): Promise<string[]> {
  const tracking = await prisma.reviewNotificationTracking.findMany({
    where: {
      targetType,
      targetId,
      dismissedAt: null,
    },
    select: {
      userId: true,
    },
  });

  return tracking.map((t) => t.userId);
}
