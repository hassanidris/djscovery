"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function getFoundingAnalytics() {
  await requireAdmin();

  const [
    totalApplications,
    totalMembers,
    totalWaitlist,
    applicationStatusGroups,
    memberStatusGroups,
    countryGroups,
    cityGroups,
    utmSourceGroups,
    utmCampaignGroups,
    timeToApproveStats,
    timeToOnboardStats,
  ] = await prisma.$transaction([
    prisma.foundingApplication.count({
      where: { deletedAt: { equals: null } },
    }),
    prisma.foundingMember.count(),
    prisma.waitlistEntry.count(),
    prisma.foundingApplication.groupBy({
      by: ["status"],
      where: { deletedAt: { equals: null } },
      _count: { id: true },
    }),
    prisma.foundingMember.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.foundingApplication.groupBy({
      by: ["countryId"],
      where: {
        deletedAt: { equals: null },
        countryId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { countryId: "desc" } },
      take: 10,
    }),
    prisma.foundingApplication.groupBy({
      by: ["cityId"],
      where: {
        deletedAt: { equals: null },
        cityId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { cityId: "desc" } },
      take: 10,
    }),
    prisma.waitlistEntry.groupBy({
      by: ["utmSource"],
      where: { utmSource: { not: null } },
      _count: { id: true },
      orderBy: { _count: { utmSource: "desc" } },
      take: 10,
    }),
    prisma.waitlistEntry.groupBy({
      by: ["utmCampaign"],
      where: { utmCampaign: { not: null } },
      _count: { id: true },
      orderBy: { _count: { utmCampaign: "desc" } },
      take: 10,
    }),
    prisma.foundingApplication.aggregate({
      where: {
        deletedAt: { equals: null },
        status: "APPROVED",
        reviewedAt: { not: null },
      },
      _avg: {
        reviewedAt: true,
      },
    }),
    prisma.foundingMember.aggregate({
      where: { launchedAt: { not: null } },
      _avg: {
        launchedAt: true,
      },
    }),
  ]);

  const countryIds = countryGroups.map((g) => g.countryId);
  const cityIds = cityGroups.map((g) => g.cityId);

  const [countries, cities] = await prisma.$transaction([
    prisma.country.findMany({
      where: { id: { in: countryIds } },
      select: { id: true, name: true },
    }),
    prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true },
    }),
  ]);

  const countryMap = new Map(countries.map((c) => [c.id, c.name]));
  const cityMap = new Map(cities.map((c) => [c.id, c.name]));

  const countsByStatus = Object.fromEntries(
    applicationStatusGroups.map((g) => [g.status, g._count.id]),
  );

  const approved = countsByStatus.APPROVED || 0;
  const reviewed = approved + (countsByStatus.REJECTED || 0);
  const acceptanceRate = reviewed > 0 ? (approved / reviewed) * 100 : 0;

  const memberCounts = Object.fromEntries(
    memberStatusGroups.map((g) => [g.status, g._count.id]),
  );
  const activeMembers = memberCounts.ACTIVE || 0;
  const onboardingRate =
    approved > 0 ? (activeMembers / approved) * 100 : 0;

  const avgTimeToApprove = timeToApproveStats._avg.reviewedAt
    ? timeToApproveStats._avg.reviewedAt.getTime()
    : null;
  const avgTimeToOnboard = timeToOnboardStats._avg.launchedAt
    ? timeToOnboardStats._avg.launchedAt.getTime()
    : null;

  return {
    funnel: {
      waitlist: totalWaitlist,
      applications: totalApplications,
      approved: approved,
      members: totalMembers,
      active: activeMembers,
    },
    rates: {
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      onboardingRate: Math.round(onboardingRate * 10) / 10,
    },
    timing: {
      avgTimeToApprove: avgTimeToApprove
        ? Math.round(avgTimeToApprove / (1000 * 60 * 60 * 24))
        : null,
      avgTimeToOnboard: avgTimeToOnboard
        ? Math.round(avgTimeToOnboard / (1000 * 60 * 60 * 24))
        : null,
    },
    byCountry: countryGroups.map((g) => ({
      name: countryMap.get(g.countryId) ?? "Unknown",
      count: g._count.id,
    })),
    byCity: cityGroups.map((g) => ({
      name: cityMap.get(g.cityId) ?? "Unknown",
      count: g._count.id,
    })),
    utmSources: utmSourceGroups.map((g) => ({
      source: g.utmSource ?? "Unknown",
      count: g._count.id,
    })),
    utmCampaigns: utmCampaignGroups.map((g) => ({
      campaign: g.utmCampaign ?? "Unknown",
      count: g._count.id,
    })),
  };
}
