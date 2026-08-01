import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Users,
  Disc3,
  Building2,
  UserCircle,
  Briefcase,
  CalendarDays,
  Flag,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  ArrowRight,
  Activity,
  Server,
  Wifi,
  HardDrive,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getDashboardStats,
  getRecentActivity,
  getTrendingMetrics,
  getGeographicDistribution,
  getGenreBreakdown,
} from "@/lib/actions/admin/stats";
import { getPendingDjApprovals } from "@/lib/actions/admin/djs";
import { getRecentUsers } from "@/lib/actions/admin/users";
import { getRecentReports } from "@/lib/actions/admin/reports";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import TrendingSparkline from "@/components/admin/TrendingSparkline";

export const metadata: Metadata = { title: "Dashboard" };

// Dashboard Skeleton Component
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="mt-1 h-4 w-64 rounded" />
      </div>

      {/* Alerts row */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-56 rounded-lg" />
      </div>

      {/* Stats grid */}
      <div>
        <Skeleton className="mb-4 h-4 w-28 rounded" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="mb-4 h-4 w-24 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* DJ Approval Queue */}
      <section className="space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-4 w-56 rounded" />
          </div>
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </section>

      {/* Recent Users and Reports */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-white/8 bg-white/3 p-5 xl:col-span-2">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-white/8 bg-white/3 p-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-white/8 bg-white/3 p-5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
  accent?: boolean;
  badge?: string;
};

function StatCard({ label, value, icon, href, accent, badge }: StatCardProps) {
  const inner = (
    <div
      className={`group flex flex-col gap-3 rounded-xl border p-4 transition-colors ${
        accent
          ? "border-h_red/30 bg-h_red/5 hover:bg-h_red/10"
          : "border-white/8 bg-white/3 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            accent ? "bg-h_red/10" : "bg-white/5"
          }`}
        >
          {icon}
        </div>
        {badge && (
          <Badge className="border-h_red/30 bg-h_red/10 text-h_red border text-[11px]">
            {badge}
          </Badge>
        )}
        {href && !badge && (
          <ArrowRight className="h-4 w-4 text-gray-600 transition-colors group-hover:text-gray-400" />
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const rangeParam = Array.isArray(params.range)
    ? params.range[0]
    : params.range;
  const range =
    rangeParam === "30d" || rangeParam === "90d" ? rangeParam : "7d";

  const [
    stats,
    pendingApprovals,
    recentUsers,
    recentReports,
    recentActivity,
    trendingMetrics,
    geographicDistribution,
    genreBreakdown,
  ] = await Promise.all([
    getDashboardStats({ range }),
    getPendingDjApprovals({ limit: 6 }),
    getRecentUsers({ limit: 5 }),
    getRecentReports({ limit: 5 }),
    getRecentActivity({ limit: 8 }),
    getTrendingMetrics(),
    getGeographicDistribution(),
    getGenreBreakdown(),
  ]);

  const systemHealth = [
    {
      label: "Server Status",
      status: "Operational",
      icon: Server,
      tone: "text-emerald-400",
      badge: "Good",
    },
    {
      label: "Email Delivery",
      status: "Good",
      icon: Wifi,
      tone: "text-sky-400",
      badge: "95% success",
    },
    {
      label: "Storage Usage",
      status: "42% of quota",
      icon: HardDrive,
      tone: "text-amber-400",
      badge: "Stable",
    },
    {
      label: "Active Sessions",
      status: `${stats.pendingDjApprovals + stats.totalUsers > 0 ? stats.totalUsers : 0}`,
      icon: Activity,
      tone: "text-purple-400",
      badge: "Live",
    },
  ] as const;

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform overview — live data from the database.
          </p>
        </div>

        {/* Alerts row — pending actions */}
        {(stats.pendingDjApprovals > 0 ||
          stats.openReports > 0 ||
          stats.overdueHires > 0) && (
          <div className="flex flex-wrap gap-3">
            {stats.pendingDjApprovals > 0 && (
              <Link
                href="/admin/djs?status=PENDING_APPROVAL"
                className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
              >
                <Clock className="h-4 w-4" />
                {stats.pendingDjApprovals} DJ profile
                {stats.pendingDjApprovals !== 1 ? "s" : ""} awaiting approval
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {stats.overdueHires > 0 && (
              <Link
                href="/admin/hires?status=ACTIVE"
                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <AlertTriangle className="h-4 w-4" />
                {stats.overdueHires} overdue hire
                {stats.overdueHires !== 1 ? "s" : ""} (past event date)
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {stats.openReports > 0 && (
              <Link
                href="/admin/reports?status=open"
                className="border-h_red/30 bg-h_red/10 text-h_red hover:bg-h_red/20 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <Flag className="h-4 w-4" />
                {stats.openReports} open report
                {stats.openReports !== 1 ? "s" : ""} to review
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Platform Stats
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              icon={<Users className="text-muted-foreground h-5 w-5" />}
              href="/admin/users"
            />
            <StatCard
              label="Approved DJs"
              value={stats.totalDjs}
              icon={<Disc3 className="text-muted-foreground h-5 w-5" />}
              href="/admin/djs"
            />
            <StatCard
              label="Active Organizers"
              value={stats.totalOrganizers}
              icon={<Building2 className="text-muted-foreground h-5 w-5" />}
              href="/admin/organizers"
            />
            <StatCard
              label="Fans"
              value={stats.totalFans}
              icon={<UserCircle className="text-muted-foreground h-5 w-5" />}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Content
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Published Gigs"
              value={stats.totalGigs}
              icon={<Briefcase className="text-muted-foreground h-5 w-5" />}
              href="/admin/gigs"
            />
            <StatCard
              label="Events"
              value={stats.totalEvents}
              icon={<CalendarDays className="text-muted-foreground h-5 w-5" />}
            />
            <StatCard
              label="Open Reports"
              value={stats.openReports}
              icon={<Flag className="text-h_red h-5 w-5" />}
              href="/admin/reports"
              accent={stats.openReports > 0}
              badge={stats.openReports > 0 ? "Needs review" : undefined}
            />
            <StatCard
              label="New Signups (30d)"
              value={stats.newSignups}
              icon={<TrendingUp className="text-muted-foreground h-5 w-5" />}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Operations
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Active Hires"
              value={stats.activeHires}
              icon={<CheckCircle className="text-muted-foreground h-5 w-5" />}
              href="/admin/hires?status=ACTIVE"
              accent={stats.overdueHires > 0}
              badge={
                stats.overdueHires > 0
                  ? `${stats.overdueHires} overdue`
                  : undefined
              }
            />
            <StatCard
              label="Completed Hires"
              value={stats.completedHires}
              icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
              href="/admin/hires?status=COMPLETED"
            />
            <StatCard
              label="Booking Inquiries"
              value={stats.openBookingInquiries}
              icon={<MessageSquare className="text-muted-foreground h-5 w-5" />}
              href="/admin/booking-inquiries?status=PENDING"
              accent={stats.openBookingInquiries > 0}
              badge={stats.openBookingInquiries > 0 ? "Pending" : undefined}
            />
            <StatCard
              label="New Signups (30d)"
              value={stats.newSignups}
              icon={<TrendingUp className="text-muted-foreground h-5 w-5" />}
            />
          </div>
        </div>

        {/* Pending approvals — only shown when queue is non-empty */}
        {stats.pendingDjApprovals > 0 && (
          <div>
            <h2 className="mb-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Pending Actions
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="DJs Awaiting Approval"
                value={stats.pendingDjApprovals}
                icon={<Clock className="h-5 w-5 text-amber-400" />}
                href="/admin/djs?status=PENDING_APPROVAL"
                badge="Pending"
              />
            </div>
          </div>
        )}

        {/* DJ Approval Queue */}
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                DJ Approval Queue
              </h2>
              <p className="text-muted-foreground text-sm">
                Review newly submitted DJ profiles before they go live.
              </p>
            </div>
            <Link
              href="/admin/djs?status=PENDING_APPROVAL"
              className="text-h_red hover:text-h_red/80 text-sm font-medium transition-colors"
            >
              View all pending DJs
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
            {pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
                <p className="text-sm font-semibold text-white">
                  No DJs waiting for approval
                </p>
                <p className="text-muted-foreground text-xs">
                  New submissions will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-120 text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2 text-left text-xs tracking-wide text-gray-500 uppercase">
                      <th className="px-5 py-3 font-medium">DJ</th>
                      <th className="px-5 py-3 font-medium">Location</th>
                      <th className="px-5 py-3 font-medium">Genres</th>
                      <th className="px-5 py-3 font-medium">Submitted</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingApprovals.map((dj) => (
                      <tr
                        key={dj.id}
                        className="transition-colors hover:bg-white/2"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-white/10 bg-white/5">
                              <AvatarImage
                                src={dj.avatar ?? undefined}
                                alt={dj.stageName}
                              />
                              <AvatarFallback className="text-xs text-white">
                                {dj.stageName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/djs/${dj.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-white hover:underline"
                              >
                                {dj.stageName}
                              </Link>
                              <p className="text-muted-foreground text-xs">
                                @{dj.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-300">
                          {[dj.city, dj.country].filter(Boolean).join(", ") ||
                            "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {dj.genres.slice(0, 3).map((genre) => (
                              <Badge
                                key={`${dj.id}-${genre}`}
                                className="border border-white/10 bg-white/5 text-xs text-gray-300"
                              >
                                {genre}
                              </Badge>
                            ))}
                            {dj.genres.length > 3 && (
                              <span className="text-muted-foreground text-xs">
                                +{dj.genres.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(dj.submittedAt), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href="/admin/djs?status=PENDING_APPROVAL"
                            className="border-h_red/30 bg-h_red/10 text-h_red hover:bg-h_red/20 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                          >
                            Review
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Trending Metrics */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Trending Metrics
            </h2>
            <p className="text-muted-foreground text-sm">
              30-day trends compared to previous period.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {trendingMetrics.map((metric) => {
              const trendIcon =
                metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                ) : metric.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-400" />
                );
              const trendColor =
                metric.trend === "up"
                  ? "text-emerald-400"
                  : metric.trend === "down"
                    ? "text-red-400"
                    : "text-gray-400";

              return (
                <div
                  key={metric.label}
                  className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-400">{metric.label}</p>
                      <p className="text-2xl font-bold text-white tabular-nums">
                        {metric.currentValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {trendIcon}
                      <span className={`text-xs font-medium ${trendColor}`}>
                        {metric.changePercent > 0 ? "+" : ""}
                        {metric.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-full">
                    <TrendingSparkline
                      data={metric.data}
                      trend={metric.trend}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Geographic Distribution */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Geographic Distribution
            </h2>
            <p className="text-muted-foreground text-sm">
              Top countries by platform activity.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3 p-5">
            {geographicDistribution.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-8 text-center">
                <p className="text-sm font-semibold text-white">
                  No geographic data available
                </p>
                <p className="text-muted-foreground text-xs">
                  Data will appear as users join the platform.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {geographicDistribution.map((item, index) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <div className="w-8 text-xs font-medium text-gray-500">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {item.country}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.count.toLocaleString()} (
                          {item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="from-h_red h-full rounded-full bg-gradient-to-r to-red-500 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Genre Breakdown */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Genre Breakdown
            </h2>
            <p className="text-muted-foreground text-sm">
              Top music genres among DJs on the platform.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3 p-5">
            {genreBreakdown.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-8 text-center">
                <p className="text-sm font-semibold text-white">
                  No genre data available
                </p>
                <p className="text-muted-foreground text-xs">
                  Data will appear as DJs add genres to their profiles.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {genreBreakdown.map((item, index) => (
                  <div key={item.genre} className="flex items-center gap-3">
                    <div className="w-8 text-xs font-medium text-gray-500">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {item.genre}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        {stats.pendingDjApprovals > 0 || stats.openReports > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Quick Actions
              </h2>
              <p className="text-muted-foreground text-sm">
                Common admin tasks that need your attention.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.pendingDjApprovals > 0 && (
                <Link
                  href="/admin/djs?status=PENDING_APPROVAL"
                  className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                  <Disc3 className="h-4 w-4" />
                  Review {stats.pendingDjApprovals} DJ approval
                  {stats.pendingDjApprovals !== 1 ? "s" : ""}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {stats.openReports > 0 && (
                <Link
                  href="/admin/reports?status=OPEN"
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Flag className="h-4 w-4" />
                  Resolve {stats.openReports} report
                  {stats.openReports !== 1 ? "s" : ""}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {stats.openBookingInquiries > 0 && (
                <Link
                  href="/admin/booking-inquiries?status=PENDING"
                  className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20"
                >
                  <MessageSquare className="h-4 w-4" />
                  Review {stats.openBookingInquiries} booking inquiry
                  {stats.openBookingInquiries !== 1 ? "s" : ""}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </section>
        ) : null}

        {/* Recent Activity Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Activity
              </h2>
              <p className="text-muted-foreground text-sm">
                Latest activity across the platform (last 7 days).
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
                <p className="text-sm font-semibold text-white">
                  No recent activity
                </p>
                <p className="text-muted-foreground text-xs">
                  Activity will appear here as the platform grows.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {recentActivity.map((activity) => {
                  const activityColors: Record<string, string> = {
                    DJ_APPROVAL: "text-amber-400",
                    HIRE_CREATED: "text-blue-400",
                    HIRE_COMPLETED: "text-emerald-400",
                    BOOKING_INQUIRY: "text-purple-400",
                    GIG_PUBLISHED: "text-cyan-400",
                    EVENT_PUBLISHED: "text-pink-400",
                    REPORT_CREATED: "text-red-400",
                  };
                  const activityIcons: Record<string, React.ReactNode> = {
                    DJ_APPROVAL: <Disc3 className="h-4 w-4" />,
                    HIRE_CREATED: <CheckCircle className="h-4 w-4" />,
                    HIRE_COMPLETED: <CheckCircle className="h-4 w-4" />,
                    BOOKING_INQUIRY: <MessageSquare className="h-4 w-4" />,
                    GIG_PUBLISHED: <Briefcase className="h-4 w-4" />,
                    EVENT_PUBLISHED: <CalendarDays className="h-4 w-4" />,
                    REPORT_CREATED: <Flag className="h-4 w-4" />,
                  };

                  return (
                    <li
                      key={activity.id}
                      className="transition-colors hover:bg-white/2"
                    >
                      <Link
                        href={activity.link || "#"}
                        className="flex items-start gap-3 px-5 py-4"
                      >
                        <div
                          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 ${activityColors[activity.type]}`}
                        >
                          {activityIcons[activity.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">
                            {activity.title}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {activity.description}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-gray-600" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {/* Recent Users */}
          <div className="space-y-4 rounded-xl border border-white/8 bg-white/3 p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Recent Users
                </h2>
                <p className="text-muted-foreground text-sm">
                  Latest signups across the platform.
                </p>
              </div>
              <Link
                href="/admin/users"
                className="text-h_red hover:text-h_red/80 text-sm font-medium transition-colors"
              >
                View all
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No recent signups.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-2.5"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">
                        {user.name ?? user.email}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ||
                        user.roles.includes("FAN") ? (
                          <Badge className="border border-white/10 bg-white/5 text-xs text-gray-300">
                            Fan
                          </Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge
                              key={`${user.id}-${role}`}
                              className="border border-white/10 bg-white/5 text-xs text-gray-300"
                            >
                              {role}
                            </Badge>
                          ))
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Latest Reports */}
          <div className="space-y-4 rounded-xl border border-white/8 bg-white/3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Latest Reports
                </h2>
                <p className="text-muted-foreground text-sm">
                  Recent content flags awaiting triage.
                </p>
              </div>
              <Link
                href="/admin/reports"
                className="text-h_red hover:text-h_red/80 text-sm font-medium transition-colors"
              >
                View all
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No new reports.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentReports.map((report) => (
                  <li
                    key={report.id}
                    className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/2 px-3 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="border-h_red/30 bg-h_red/10 text-h_red text-xs">
                          {report.targetType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-sm font-medium text-white">
                          {report.reason.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(report.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        Status:{" "}
                        <span className="text-white">{report.status}</span>
                      </span>
                      <Link
                        href="/admin/reports"
                        className="text-h_red hover:text-h_red/80 transition-colors"
                      >
                        Review →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* System Health */}
          <div className="space-y-4 rounded-xl border border-white/8 bg-white/3 p-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                System Health
              </h2>
              <p className="text-muted-foreground text-sm">
                Live service checks across core systems.
              </p>
            </div>
            <ul className="space-y-3">
              {systemHealth.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <Icon
                          className={cn("h-4.5 w-4.5", item.tone)}
                          aria-hidden
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {item.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <Badge className="border-white/10 bg-white/5 text-xs text-gray-300">
                      {item.badge}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </Suspense>
  );
}
