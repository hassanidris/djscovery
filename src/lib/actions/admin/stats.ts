"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export type DashboardStats = {
  totalUsers: number;
  totalDjs: number;
  totalOrganizers: number;
  totalFans: number;
  totalGigs: number;
  totalEvents: number;
  openReports: number;
  newSignups: number;
  pendingDjApprovals: number;
};

export async function getDashboardStats({
  range = "7d",
}: {
  range?: "7d" | "30d" | "90d";
} = {}): Promise<DashboardStats> {
  await requireAdmin();

  const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - days);

  const [
    totalUsers,
    totalDjs,
    totalOrganizers,
    totalFans,
    totalGigs,
    totalEvents,
    openReports,
    newSignups,
    pendingDjApprovals,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.djProfile.count({ where: { deletedAt: null, status: "APPROVED" } }),
    prisma.organizerProfile.count({
      where: { deletedAt: null, status: "ACTIVE" },
    }),
    prisma.fanProfile.count({ where: { deletedAt: null } }),
    prisma.gig.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.event.count({
      where: { deletedAt: null, status: { in: ["PUBLISHED", "COMPLETED"] } },
    }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.user.count({
      where: { deletedAt: null, createdAt: { gte: rangeStart } },
    }),
    prisma.djProfile.count({
      where: { deletedAt: null, status: "PENDING_APPROVAL" },
    }),
  ]);

  return {
    totalUsers,
    totalDjs,
    totalOrganizers,
    totalFans,
    totalGigs,
    totalEvents,
    openReports,
    newSignups,
    pendingDjApprovals,
  };
}
