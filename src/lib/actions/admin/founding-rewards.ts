"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";
import {
  activateFoundingRewards,
  deactivateFoundingRewards,
} from "@/lib/actions/founding/activate-rewards";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  launchAnnouncementSubject,
  launchAnnouncementHtml,
} from "@/lib/email/templates/launchAnnouncement";

type ActionResult = { success: true; data?: any } | { error: string };

export async function activateLaunchRewards(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const djProfileId = formData.get("djProfileId");

  try {
    if (djProfileId) {
      // Individual activation
      const result = await activateFoundingRewards(
        parseInt(djProfileId as string),
      );

      if (result.activatedCount === 0) {
        return { error: "No founding member to activate" };
      }

      for (const member of result.members) {
        await sendEmail({
          to: member.email,
          userId: adminId,
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

      return {
        success: true,
        data: result,
      };
    } else {
      // Bulk activation
      const result = await activateFoundingRewards();

      if (result.activatedCount === 0) {
        return { error: "No founding members to activate" };
      }

      for (const member of result.members) {
        await sendEmail({
          to: member.email,
          userId: adminId,
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

      return {
        success: true,
        data: result,
      };
    }
  } catch (error) {
    console.error("Failed to activate launch rewards:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to activate launch rewards",
    };
  }
}

export async function deactivateLaunchRewards(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const djProfileId = formData.get("djProfileId");

  try {
    if (djProfileId) {
      // Individual deactivation
      const count = await deactivateFoundingRewards(
        parseInt(djProfileId as string),
      );

      revalidatePath("/admin/founding/members");
      revalidatePath("/");

      return {
        success: true,
        data: { deactivatedCount: count },
      };
    } else {
      // Bulk deactivation
      const count = await deactivateFoundingRewards();

      revalidatePath("/admin/founding/members");
      revalidatePath("/");

      return {
        success: true,
        data: { deactivatedCount: count },
      };
    }
  } catch (error) {
    console.error("Failed to deactivate launch rewards:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to deactivate launch rewards",
    };
  }
}
