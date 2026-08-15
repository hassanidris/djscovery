"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { generateModerationSuggestions } from "./moderation-suggestions";

export interface ReportReviewIntegration {
  reportId: number;
  reviewId: number;
  reportReason: string;
  reportDescription: string | null;
  reportStatus: string;
  reporterId: string;
  reviewRating: number;
  reviewText: string | null;
  moderationSuggestion?: {
    suggestedAction: string;
    confidence: number;
    priority: string;
    reasons: string[];
  };
  linked: boolean;
  autoResolved: boolean;
}

export async function linkReportToReview(
  reportId: number,
): Promise<ReportReviewIntegration | null> {
  await requireAdmin();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report || report.targetType !== "REVIEW") {
    return null;
  }

  const reviewId = parseInt(report.targetId);
  const review = await prisma.djRating.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      rating: true,
      review: true,
      moderationStatus: true,
    },
  });

  if (!review) {
    return null;
  }

  // Generate moderation suggestion
  const suggestion = await generateModerationSuggestions(reviewId);

  // Auto-resolve if high confidence and action is clear
  let autoResolved = false;
  if (
    suggestion.confidence > 0.9 &&
    (suggestion.suggestedAction === "delete" ||
      suggestion.suggestedAction === "flag")
  ) {
    // Auto-apply the suggestion
    const { applySuggestion } = await import("./moderation-suggestions");
    await applySuggestion(
      reviewId,
      suggestion.suggestedAction as any,
      `Auto-resolved from report #${reportId}: ${report.reason}`,
    );

    // Update report status
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "RESOLVED",
        adminNote: `Auto-resolved via moderation suggestion. Action: ${suggestion.suggestedAction}`,
      },
    });

    autoResolved = true;
  }

  return {
    reportId,
    reviewId,
    reportReason: report.reason,
    reportDescription: report.description,
    reportStatus: report.status,
    reporterId: report.reporterId,
    reviewRating: review.rating,
    reviewText: review.review,
    moderationSuggestion: suggestion,
    linked: true,
    autoResolved,
  };
}

export async function getReviewReports(
  reviewId: number,
): Promise<ReportReviewIntegration[]> {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    where: {
      targetType: "REVIEW",
      targetId: reviewId.toString(),
    },
    orderBy: { createdAt: "desc" },
  });

  const integrations: ReportReviewIntegration[] = [];

  for (const report of reports) {
    const integration = await linkReportToReview(report.id);
    if (integration) {
      integrations.push(integration);
    }
  }

  return integrations;
}

export async function getReportsNeedingReview(
  limit = 50,
): Promise<ReportReviewIntegration[]> {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    where: {
      targetType: "REVIEW",
      status: { in: ["OPEN", "UNDER_REVIEW"] },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const integrations: ReportReviewIntegration[] = [];

  for (const report of reports) {
    const integration = await linkReportToReview(report.id);
    if (integration) {
      integrations.push(integration);
    }
  }

  // Sort by priority and confidence
  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  integrations.sort((a, b) => {
    const aPriority = a.moderationSuggestion?.priority || "low";
    const bPriority = b.moderationSuggestion?.priority || "low";
    const priorityDiff =
      (priorityOrder[aPriority] || 3) - (priorityOrder[bPriority] || 3);
    if (priorityDiff !== 0) return priorityDiff;
    return (
      (b.moderationSuggestion?.confidence || 0) -
      (a.moderationSuggestion?.confidence || 0)
    );
  });

  return integrations;
}

export async function resolveReportWithReviewAction(
  reportId: number,
  action: "approve" | "hide" | "flag" | "delete",
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report || report.targetType !== "REVIEW") {
    return { success: false, error: "Report not found or not a review report" };
  }

  const reviewId = parseInt(report.targetId);

  // Apply the action to the review
  const { applySuggestion } = await import("./moderation-suggestions");
  const result = await applySuggestion(reviewId, action as any, adminNote);

  if (!result.success) {
    return result;
  }

  // Update report status
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "RESOLVED",
      adminNote: adminNote || `Resolved with action: ${action}`,
    },
  });

  return { success: true };
}

export async function getReportReviewStats(): Promise<{
  totalReports: number;
  reviewReports: number;
  resolvedReports: number;
  autoResolvedReports: number;
  byReason: Record<string, number>;
  avgResolutionTime: number;
}> {
  await requireAdmin();

  const [totalReports, reviewReports, resolvedReports] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { targetType: "REVIEW" } }),
    prisma.report.count({ where: { status: "RESOLVED" } }),
  ]);

  // Get reports with admin notes indicating auto-resolution
  const allResolvedReports = await prisma.report.findMany({
    where: { status: "RESOLVED" },
    select: { adminNote: true, createdAt: true, reviewedAt: true },
  });

  const autoResolvedReports = allResolvedReports.filter((r) =>
    r.adminNote?.includes("Auto-resolved"),
  ).length;

  // Calculate average resolution time
  const resolvedWithTime = allResolvedReports.filter(
    (r) => r.reviewedAt !== null,
  );
  const avgResolutionTime =
    resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, r) => {
          const time = r.reviewedAt!.getTime() - r.createdAt.getTime();
          return sum + time / (1000 * 60 * 60); // Convert to hours
        }, 0) / resolvedWithTime.length
      : 0;

  // Group by reason
  const allReports = await prisma.report.findMany({
    where: { targetType: "REVIEW" },
    select: { reason: true },
  });

  const byReason: Record<string, number> = {};
  for (const report of allReports) {
    byReason[report.reason] = (byReason[report.reason] || 0) + 1;
  }

  return {
    totalReports,
    reviewReports,
    resolvedReports,
    autoResolvedReports,
    byReason,
    avgResolutionTime,
  };
}
