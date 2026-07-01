"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  MarkReportUnderReviewSchema,
  ResolveReportSchema,
  DismissReportSchema,
} from "@/lib/validations/admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { error: string };

const SubmitReportSchema = z.object({
  targetType: z.enum([
    "DJ_PROFILE",
    "ORGANIZER_PROFILE",
    "GIG",
    "REVIEW",
    "MEDIA",
  ]),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.enum([
    "FAKE_PROFILE",
    "SPAM",
    "INAPPROPRIATE_CONTENT",
    "SCAM",
    "HARASSMENT",
    "WRONG_INFORMATION",
    "OTHER",
  ]),
  description: z.string().max(1000).optional(),
});

export async function submitReport(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to submit a report" };

  const parsed = SubmitReportSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { targetType, targetId, reason, description } = parsed.data;

  try {
    const adminUsers = await prisma.userRole.findMany({
      where: { role: "ADMIN" },
      select: { userId: true },
    });

    await prisma.$transaction([
      prisma.report.create({
        data: {
          reporterId: user.id,
          targetType,
          targetId,
          reason,
          description,
        },
      }),
      ...adminUsers.map((admin) =>
        prisma.notification.create({
          data: {
            type: "REPORT_SUBMITTED",
            recipientId: admin.userId,
            senderId: user.id,
            data: { targetType, targetId, reason },
          },
        }),
      ),
    ]);

    return { success: true };
  } catch {
    return { error: "Failed to submit report" };
  }
}

export async function markReportUnderReview(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = MarkReportUnderReviewSchema.safeParse({
    reportId: formData.get("reportId"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { reportId } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: { status: "UNDER_REVIEW", reviewedById: adminId },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "REPORT_UNDER_REVIEW",
          targetType: "Report",
          targetId: String(reportId),
        },
      }),
    ]);

    revalidatePath("/admin/reports");
    return { success: true };
  } catch {
    return { error: "Failed to update report status" };
  }
}

export async function resolveReport(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = ResolveReportSchema.safeParse({
    reportId: formData.get("reportId"),
    adminNote: formData.get("adminNote") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { reportId, adminNote } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: {
          status: "RESOLVED",
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNote: adminNote ?? null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "RESOLVE_REPORT",
          targetType: "Report",
          targetId: String(reportId),
          metadata: adminNote ? { adminNote } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/reports");
    return { success: true };
  } catch {
    return { error: "Failed to resolve report" };
  }
}

export async function dismissReport(formData: FormData): Promise<ActionResult> {
  const { userId: adminId } = await requireAdmin();

  const parsed = DismissReportSchema.safeParse({
    reportId: formData.get("reportId"),
    adminNote: formData.get("adminNote") ?? undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { reportId, adminNote } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DISMISSED",
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNote: adminNote ?? null,
        },
      }),
      prisma.adminActionLog.create({
        data: {
          adminId,
          action: "DISMISS_REPORT",
          targetType: "Report",
          targetId: String(reportId),
          metadata: adminNote ? { adminNote } : undefined,
        },
      }),
    ]);

    revalidatePath("/admin/reports");
    return { success: true };
  } catch {
    return { error: "Failed to dismiss report" };
  }
}

export type AdminReport = {
  id: number;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  reporter: { username: string; name: string | null; image: string | null };
  reviewedBy: { username: string } | null;
};

export type DashboardReport = {
  id: number;
  targetType: string;
  reason: string;
  status: string;
  createdAt: Date;
};

export async function getAdminReports({
  cursor,
  take = 20,
  status,
  targetType,
}: {
  cursor?: number;
  take?: number;
  status?: string;
  targetType?: string;
}): Promise<{ reports: AdminReport[]; nextCursor: number | null }> {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    where: {
      ...(status
        ? {
            status: status as
              | "OPEN"
              | "UNDER_REVIEW"
              | "RESOLVED"
              | "DISMISSED",
          }
        : {}),
      ...(targetType
        ? {
            targetType: targetType as
              | "DJ_PROFILE"
              | "ORGANIZER_PROFILE"
              | "GIG"
              | "REVIEW"
              | "MEDIA",
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      description: true,
      status: true,
      adminNote: true,
      createdAt: true,
      reporter: { select: { username: true, name: true, image: true } },
      reviewedBy: { select: { username: true } },
    },
  });

  const hasNextPage = reports.length > take;
  if (hasNextPage) reports.pop();

  return {
    reports,
    nextCursor: hasNextPage ? (reports[reports.length - 1]?.id ?? null) : null,
  };
}

export async function getRecentReports({
  limit = 5,
}: {
  limit?: number;
} = {}): Promise<DashboardReport[]> {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      targetType: true,
      reason: true,
      status: true,
      createdAt: true,
    },
  });

  return reports;
}
