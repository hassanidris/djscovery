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
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.foundingMember.groupBy({
      by: ["status"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
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
  ]);

  const countryIds = countryGroups
    .map((g) => g.countryId)
    .filter((id): id is number => id !== null);
  const cityIds = cityGroups
    .map((g) => g.cityId)
    .filter((id): id is number => id !== null);

  const [countries, cities, approvedApplications, launchedMembers] =
    await prisma.$transaction([
      prisma.country.findMany({
        where: { id: { in: countryIds } },
        select: { id: true, name: true },
      }),
      prisma.city.findMany({
        where: { id: { in: cityIds } },
        select: { id: true, name: true },
      }),
      prisma.foundingApplication.findMany({
        where: {
          deletedAt: { equals: null },
          status: "APPROVED",
        },
        select: { submittedAt: true, reviewedAt: true },
      }),
      prisma.foundingMember.findMany({
        where: {
          launchedAt: { not: undefined },
        },
        select: { joinedAt: true, launchedAt: true },
      }),
    ]);

  const countryMap = new Map(countries.map((c) => [c.id, c.name]));
  const cityMap = new Map(cities.map((c) => [c.id, c.name]));

  const countsByStatus: Record<string, number> = {};
  for (const group of applicationStatusGroups) {
    const count =
      typeof group._count === "number"
        ? group._count
        : (group._count as any).id || 0;
    countsByStatus[group.status] = count;
  }

  const approved = countsByStatus.APPROVED || 0;
  const reviewed = approved + (countsByStatus.REJECTED || 0);
  const acceptanceRate = reviewed > 0 ? (approved / reviewed) * 100 : 0;

  const memberCounts: Record<string, number> = {};
  for (const group of memberStatusGroups) {
    const count =
      typeof group._count === "number"
        ? group._count
        : (group._count as any).id || 0;
    memberCounts[group.status] = count;
  }
  const activeMembers = memberCounts.ACTIVE || 0;
  const onboardingRate = approved > 0 ? (activeMembers / approved) * 100 : 0;

  // Calculate average time to approve
  const validApprovedApps = approvedApplications.filter(
    (app) => app.reviewedAt && app.submittedAt,
  );
  const avgTimeToApprove =
    validApprovedApps.length > 0
      ? validApprovedApps.reduce((sum, app) => {
          const days =
            (app.reviewedAt!.getTime() - app.submittedAt!.getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / validApprovedApps.length
      : null;

  // Calculate average time to onboard
  const validLaunchedMembers = launchedMembers.filter(
    (member) => member.launchedAt && member.joinedAt,
  );
  const avgTimeToOnboard =
    validLaunchedMembers.length > 0
      ? validLaunchedMembers.reduce((sum, member) => {
          const days =
            (member.launchedAt!.getTime() - member.joinedAt!.getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / validLaunchedMembers.length
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
      avgTimeToApprove: avgTimeToApprove ? Math.round(avgTimeToApprove) : null,
      avgTimeToOnboard: avgTimeToOnboard ? Math.round(avgTimeToOnboard) : null,
    },
    byCountry: countryGroups.map((g) => ({
      name: g.countryId
        ? (countryMap.get(g.countryId) ?? "Unknown")
        : "Unknown",
      count:
        typeof g._count === "number" ? g._count : (g._count as any).id || 0,
    })),
    byCity: cityGroups.map((g) => ({
      name: g.cityId ? (cityMap.get(g.cityId) ?? "Unknown") : "Unknown",
      count:
        typeof g._count === "number" ? g._count : (g._count as any).id || 0,
    })),
    utmSources: utmSourceGroups.map((g) => ({
      source: g.utmSource ?? "Unknown",
      count:
        typeof g._count === "number" ? g._count : (g._count as any).id || 0,
    })),
    utmCampaigns: utmCampaignGroups.map((g) => ({
      campaign: g.utmCampaign ?? "Unknown",
      count:
        typeof g._count === "number" ? g._count : (g._count as any).id || 0,
    })),
  };
}
