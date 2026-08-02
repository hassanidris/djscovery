import prisma from "@/lib/client";
import { createClient } from "@supabase/supabase-js";
import { calculateOrganizerReputationScore } from "./organizer-calculate";

export async function updateOrganizerReputationScore(
  organizerProfileId: number,
  changeReason:
    | "EVENT_REVIEW_ADDED"
    | "GIG_REVIEW_ADDED"
    | "GIG_COMPLETED"
    | "HIRE_CANCELLED"
    | "NO_SHOW_REPORTED"
    | "PROFILE_UPDATED"
    | "ORGANIZER_REVIEW_ADDED",
): Promise<{ success: true } | { success: false; error: string }> {
  // Preload auth data outside the transaction
  let user;
  try {
    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { id: organizerProfileId },
      select: { userId: true },
    });
    if (!organizerProfile)
      throw new Error(`Organizer profile not found: ${organizerProfileId}`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data, error } = await supabase.auth.admin.getUserById(
      organizerProfile.userId,
    );
    if (error || !data.user) {
      throw new Error(
        `Supabase user lookup failed for organizer profile ${organizerProfileId}: ${error?.message ?? "user not found"}`,
      );
    }
    user = data.user;
  } catch (e) {
    console.error(
      "Failed to preload auth data for organizer reputation update:",
      e,
    );
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Unknown error during auth preload",
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        // Serialize reputation recomputes for this organizer
        await tx.$executeRawUnsafe(
          "SELECT pg_advisory_xact_lock(hashtextextended('organizer-reputation:' || $1::text, 0))",
          organizerProfileId,
        );

        // Compute and read while holding the lock
        const newScores = await calculateOrganizerReputationScore(
          organizerProfileId,
          tx,
          user,
        );

        const existing = await tx.organizerReputationScore.findUnique({
          where: { organizerProfileId },
        });

        const previousTotal = existing?.totalScore ?? 0;

        const reputationScore = await tx.organizerReputationScore.upsert({
          where: { organizerProfileId },
          create: {
            organizerProfileId,
            ...newScores,
            trendDirection: "STABLE",
          },
          update: {
            ...newScores,
            calculatedAt: new Date(),
            trendDirection:
              newScores.totalScore > previousTotal + 20
                ? "RISING"
                : newScores.totalScore < previousTotal - 20
                  ? "FALLING"
                  : "STABLE",
          },
        });

        await tx.organizerReputationHistory.create({
          data: {
            organizerReputationScoreId: reputationScore.id,
            previousTotal,
            newTotal: newScores.totalScore,
            changeReason,
          },
        });
      },
      {
        maxWait: 5000, // 5 seconds to acquire transaction
        timeout: 10000, // 10 seconds total transaction timeout
      },
    );
  } catch (e) {
    console.error("Failed to update organizer reputation score:", e);
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Unknown error during reputation update",
    };
  }

  return { success: true };
}
