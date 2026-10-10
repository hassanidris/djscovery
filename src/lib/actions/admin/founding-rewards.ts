"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";
import {
  activateFoundingRewards,
  deactivateFoundingRewards,
  type ActivationResult,
} from "@/lib/actions/founding/activate-rewards";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  launchAnnouncementSubject,
  launchAnnouncementHtml,
} from "@/lib/email/templates/launchAnnouncement";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/action-result";
import prisma from "@/lib/client";

export async function activateLaunchRewards(
  formData: FormData,
): Promise<ActionResult<ActivationResult | { deactivatedCount: number }>> {
  const { userId: adminId } = await requireAdmin();

  const djProfileId = formData.get("djProfileId");

  try {
    if (djProfileId) {
      const parsedId = Number(djProfileId);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return actionError("Invalid profile ID");
      }

      const result = await activateFoundingRewards(parsedId);

      if (result.activatedCount === 0) {
        return actionError("No founding member to activate");
      }

      for (const member of result.members) {
        const profile = await prisma.djProfile.findUnique({
          where: { id: parsedId },
          select: { userId: true },
        });
        if (!profile) continue;

        await sendEmail({
          to: member.email,
          userId: profile.userId,
          emailType: "LAUNCH_ANNOUNCEMENT" as any,
          subject: launchAnnouncementSubject(),
          html: launchAnnouncementHtml({
            name: member.stageName,
            foundingNumber: member.foundingNumber ?? 0,
          }),
        });
      }

      revalidatePath("/admin/founding/members");
      revalidatePath("/");

      return actionSuccess(result);
    } else {
      const result = await activateFoundingRewards();

      if (result.activatedCount === 0) {
        return actionError("No founding members to activate");
      }

      for (const member of result.members) {
        const foundingMember = await prisma.foundingMember.findUnique({
          where: { id: member.id },
          select: { djProfile: { select: { userId: true } } },
        });
        if (!foundingMember) continue;

        await sendEmail({
          to: member.email,
          userId: foundingMember.djProfile.userId,
          emailType: "LAUNCH_ANNOUNCEMENT" as any,
          subject: launchAnnouncementSubject(),
          html: launchAnnouncementHtml({
            name: member.stageName,
            foundingNumber: member.foundingNumber ?? 0,
          }),
        });
      }

      revalidatePath("/admin/founding/members");
      revalidatePath("/");

      return actionSuccess(result);
    }
  } catch (error) {
    console.error("Failed to activate launch rewards:", error);
    return actionError(
      error instanceof Error
        ? error.message
        : "Failed to activate launch rewards",
    );
  }
}

export async function deactivateLaunchRewards(
  formData: FormData,
): Promise<ActionResult<{ deactivatedCount: number }>> {
  const { userId: adminId } = await requireAdmin();

  const djProfileId = formData.get("djProfileId");

  try {
    if (djProfileId) {
      const parsedId = Number(djProfileId);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return actionError("Invalid profile ID");
      }

      const count = await deactivateFoundingRewards(parsedId);

      revalidatePath("/admin/founding/members");
      revalidatePath("/");

      return actionSuccess({ deactivatedCount: count });
    } else {
      const count = await deactivateFoundingRewards();

      revalidatePath("/admin/founding/members");
      revalidatePath("/");

      return actionSuccess({ deactivatedCount: count });
    }
  } catch (error) {
    console.error("Failed to deactivate launch rewards:", error);
    return actionError(
      error instanceof Error
        ? error.message
        : "Failed to deactivate launch rewards",
    );
  }
}
