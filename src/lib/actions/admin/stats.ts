"use server";

import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";

export type ActivityItem = {
  id: string;
  type:
    | "DJ_APPROVAL"
    | "HIRE_CREATED"
    | "HIRE_COMPLETED"
    | "BOOKING_INQUIRY"
    | "GIG_PUBLISHED"
    | "EVENT_PUBLISHED"
    | "REPORT_CREATED";
  title: string;
  description: string;
  createdAt: Date;
  link?: string;
};

export type TrendingMetric = {
  label: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  data: number[];
};

export async function getTrendingMetrics(): Promise<TrendingMetric[]> {
  await requireAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get daily data for the last 30 days
  const dailyData = await Promise.all(
    Array.from({ length: 30 }, async (_, i) => {
      const dayStart = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const [newUsers, newHires, newInquiries, newGigs] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
            deletedAt: null,
          },
        }),
        prisma.hire.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        }),
        prisma.bookingInquiry.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        }),
        prisma.gig.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
            status: "PUBLISHED",
          },
        }),
      ]);

      return { day: i, newUsers, newHires, newInquiries, newGigs };
    }),
  );

  // Calculate totals for current and previous 30-day periods
  const currentPeriod = dailyData.slice(0, 30);
  const previousPeriodStart = sixtyDaysAgo;
  const previousPeriodEnd = thirtyDaysAgo;

  const [prevUsers, prevHires, prevInquiries, prevGigs] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
        deletedAt: null,
      },
    }),
    prisma.hire.count({
      where: {
        createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
      },
    }),
    prisma.bookingInquiry.count({
      where: {
        createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
      },
    }),
    prisma.gig.count({
      where: {
        createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
        status: "PUBLISHED",
      },
    }),
  ]);

  const currentUsers = currentPeriod.reduce((sum, d) => sum + d.newUsers, 0);
  const currentHires = currentPeriod.reduce((sum, d) => sum + d.newHires, 0);
  const currentInquiries = currentPeriod.reduce(
    (sum, d) => sum + d.newInquiries,
    0,
  );
  const currentGigs = currentPeriod.reduce((sum, d) => sum + d.newGigs, 0);

  const calculateTrend = (
    current: number,
    previous: number,
  ): {
    change: number;
    changePercent: number;
    trend: "up" | "down" | "neutral";
  } => {
    if (previous === 0)
      return { change: current, changePercent: 0, trend: "neutral" };
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    return {
      change,
      changePercent,
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    };
  };

  const userTrend = calculateTrend(currentUsers, prevUsers);
  const hireTrend = calculateTrend(currentHires, prevHires);
  const inquiryTrend = calculateTrend(currentInquiries, prevInquiries);
  const gigTrend = calculateTrend(currentGigs, prevGigs);

  return [
    {
      label: "New Users",
      currentValue: currentUsers,
      previousValue: prevUsers,
      change: userTrend.change,
      changePercent: userTrend.changePercent,
      trend: userTrend.trend,
      data: currentPeriod.map((d) => d.newUsers),
    },
    {
      label: "New Hires",
      currentValue: currentHires,
      previousValue: prevHires,
      change: hireTrend.change,
      changePercent: hireTrend.changePercent,
      trend: hireTrend.trend,
      data: currentPeriod.map((d) => d.newHires),
    },
    {
      label: "Booking Inquiries",
      currentValue: currentInquiries,
      previousValue: prevInquiries,
      change: inquiryTrend.change,
      changePercent: inquiryTrend.changePercent,
      trend: inquiryTrend.trend,
      data: currentPeriod.map((d) => d.newInquiries),
    },
    {
      label: "New Gigs",
      currentValue: currentGigs,
      previousValue: prevGigs,
      change: gigTrend.change,
      changePercent: gigTrend.changePercent,
      trend: gigTrend.trend,
      data: currentPeriod.map((d) => d.newGigs),
    },
  ];
}

export type GeographicDistribution = {
  country: string;
  count: number;
  percentage: number;
};

export async function getGeographicDistribution(): Promise<
  GeographicDistribution[]
> {
  await requireAdmin();

  // Get distribution by country for DJs, Organizers, and Gigs
  const [djCountries, organizerCountries, gigCountries] = await Promise.all([
    prisma.djProfile.groupBy({
      by: ["countryId"],
      where: { deletedAt: null, status: "APPROVED" },
      _count: true,
    }),
    prisma.organizerProfile.groupBy({
      by: ["countryId"],
      where: { deletedAt: null, status: "ACTIVE" },
      _count: true,
    }),
    prisma.gig.groupBy({
      by: ["countryId"],
      where: { deletedAt: null, status: "PUBLISHED" },
      _count: true,
    }),
  ]);

  // Get country names
  const countryIds = new Set(
    [
      ...djCountries.map((c) => c.countryId),
      ...organizerCountries.map((c) => c.countryId),
      ...gigCountries.map((c) => c.countryId),
    ].filter((id): id is number => id !== null),
  );

  const countries = await prisma.country.findMany({
    where: { id: { in: Array.from(countryIds) } },
    select: { id: true, name: true },
  });

  const countryMap = new Map(countries.map((c) => [c.id, c.name]));

  // Aggregate counts by country
  const countryCounts = new Map<number, number>();

  djCountries.forEach((c) => {
    if (c.countryId !== null) {
      countryCounts.set(
        c.countryId,
        (countryCounts.get(c.countryId) || 0) + c._count,
      );
    }
  });

  organizerCountries.forEach((c) => {
    if (c.countryId !== null) {
      countryCounts.set(
        c.countryId,
        (countryCounts.get(c.countryId) || 0) + c._count,
      );
    }
  });

  gigCountries.forEach((c) => {
    if (c.countryId !== null) {
      countryCounts.set(
        c.countryId,
        (countryCounts.get(c.countryId) || 0) + c._count,
      );
    }
  });

  const total = Array.from(countryCounts.values()).reduce(
    (sum, count) => sum + count,
    0,
  );

  const distribution: GeographicDistribution[] = Array.from(
    countryCounts.entries(),
  )
    .map(([countryId, count]) => ({
      country: countryMap.get(countryId) ?? "Unknown",
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return distribution;
}

export type GenreBreakdown = {
  genre: string;
  count: number;
  percentage: number;
};

export async function getGenreBreakdown(): Promise<GenreBreakdown[]> {
  await requireAdmin();

  // Get genres from DJ profiles with genre names
  const djGenres = await prisma.djGenre.findMany({
    where: {
      djProfile: {
        deletedAt: null,
        status: "APPROVED",
      },
    },
    select: {
      genre: {
        select: {
          name: true,
        },
      },
    },
  });

  // Count genres
  const genreCounts = new Map<string, number>();

  djGenres.forEach((djGenre) => {
    const genreName = djGenre.genre.name;
    genreCounts.set(genreName, (genreCounts.get(genreName) || 0) + 1);
  });

  const total = Array.from(genreCounts.values()).reduce(
    (sum, count) => sum + count,
    0,
  );

  const breakdown: GenreBreakdown[] = Array.from(genreCounts.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return breakdown;
}

export async function getRecentActivity({
  limit = 10,
}: {
  limit?: number;
} = {}): Promise<ActivityItem[]> {
  await requireAdmin();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    pendingDjs,
    recentHires,
    recentInquiries,
    recentGigs,
    recentEvents,
    recentReports,
  ] = await Promise.all([
    prisma.djProfile.findMany({
      where: {
        status: "PENDING_APPROVAL",
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        stageName: true,
        slug: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.hire.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: {
        id: true,
        status: true,
        agreedRate: true,
        createdAt: true,
        application: {
          select: {
            djProfile: {
              select: {
                stageName: true,
                slug: true,
              },
            },
            gig: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.bookingInquiry.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        djProfile: {
          select: {
            stageName: true,
            slug: true,
          },
        },
        organizer: {
          select: {
            organizerProfile: {
              select: {
                displayName: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.gig.findMany({
      where: {
        status: "PUBLISHED",
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        organizerProfile: {
          select: {
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.event.findMany({
      where: {
        status: { in: ["PUBLISHED", "COMPLETED"] },
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        participants: {
          select: {
            djProfile: {
              select: {
                stageName: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.report.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: {
        id: true,
        reason: true,
        targetType: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  const activities: ActivityItem[] = [];

  // DJ approvals
  pendingDjs.forEach((dj) => {
    activities.push({
      id: `dj-${dj.id}`,
      type: "DJ_APPROVAL",
      title: `New DJ profile: ${dj.stageName}`,
      description: "Awaiting admin approval",
      createdAt: dj.createdAt,
      link: `/admin/djs?status=PENDING_APPROVAL`,
    });
  });

  // Hires
  recentHires.forEach((hire) => {
    const isCompleted = hire.status === "COMPLETED";
    activities.push({
      id: `hire-${hire.id}`,
      type: isCompleted ? "HIRE_COMPLETED" : "HIRE_CREATED",
      title: isCompleted
        ? `Hire completed: ${hire.application.djProfile.stageName}`
        : `New hire: ${hire.application.djProfile.stageName}`,
      description: `${hire.application.gig.title}${hire.agreedRate ? ` • $${hire.agreedRate}` : ""}`,
      createdAt: hire.createdAt,
      link: `/admin/hires/${hire.id}`,
    });
  });

  // Booking inquiries
  recentInquiries.forEach((inquiry) => {
    activities.push({
      id: `inquiry-${inquiry.id}`,
      type: "BOOKING_INQUIRY",
      title: `Booking inquiry from ${inquiry.organizer.organizerProfile?.displayName ?? "an organizer"}`,
      description: `To ${inquiry.djProfile.stageName} • ${inquiry.status}`,
      createdAt: inquiry.createdAt,
      link: `/admin/booking-inquiries`,
    });
  });

  // Gigs
  recentGigs.forEach((gig) => {
    activities.push({
      id: `gig-${gig.id}`,
      type: "GIG_PUBLISHED",
      title: `New gig: ${gig.title}`,
      description: `By ${gig.organizerProfile.displayName}`,
      createdAt: gig.createdAt,
      link: `/gigs/${gig.slug}`,
    });
  });

  // Events
  recentEvents.forEach((event) => {
    const djName = event.participants[0]?.djProfile?.stageName || "Unknown DJ";
    activities.push({
      id: `event-${event.id}`,
      type: "EVENT_PUBLISHED",
      title: `New event: ${event.title}`,
      description: `By ${djName}`,
      createdAt: event.createdAt,
      link: `/events/${event.slug}`,
    });
  });

  // Reports
  recentReports.forEach((report) => {
    activities.push({
      id: `report-${report.id}`,
      type: "REPORT_CREATED",
      title: `New report: ${report.targetType.replace(/_/g, " ")}`,
      description: report.reason.replace(/_/g, " "),
      createdAt: report.createdAt,
      link: `/admin/reports`,
    });
  });

  // Sort by date and limit
  return activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

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
  activeHires: number;
  completedHires: number;
  openBookingInquiries: number;
  overdueHires: number;
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
  const today = new Date();

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
    activeHires,
    completedHires,
    openBookingInquiries,
    overdueHires,
  ] = await Promise.all([
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
    prisma.hire.count({ where: { status: "ACTIVE" } }),
    prisma.hire.count({ where: { status: "COMPLETED" } }),
    prisma.bookingInquiry.count({ where: { status: "PENDING" } }),
    prisma.hire.count({
      where: {
        status: "ACTIVE",
        application: {
          gig: {
            eventDate: { lt: today },
          },
        },
      },
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
    activeHires,
    completedHires,
    openBookingInquiries,
    overdueHires,
  };
}
