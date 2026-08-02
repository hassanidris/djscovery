import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cache } from "react";
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

type DashboardRange = "7d" | "30d" | "90d";

// Dashboard Skeleton Component
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="mt-2 h-4 w-64 rounded" />
      </div>

      {/* Alerts row */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-48 rounded" />
        <Skeleton className="h-10 w-48 rounded" />
      </div>

      {/* Stats grid */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      {/* Content stats */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      {/* Operations stats */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
      </div>

      {/* Pending actions */}
      <div>
        <Skeleton className="mb-4 h-5 w-32 rounded" />
        <Skeleton className="h-24 rounded" />
      </div>

      {/* DJ Approval Queue */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Recent Users */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Recent Reports */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Recent Activity */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Trending Metrics */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Geographic Distribution */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>

      {/* Genre Breakdown */}
      <div>
        <Skeleton className="mb-4 h-8 w-48 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>
    </div>
  );
}

// Child components for each data section
const CachedDashboardStats = cache(async function DashboardStats({
  range,
}: {
  range: DashboardRange;
}) {
  const stats = await getDashboardStats({ range });
  return stats;
});

const CachedPendingApprovals = cache(async function PendingApprovals() {
  const pendingApprovals = await getPendingDjApprovals({ limit: 6 });
  return pendingApprovals;
});

async function RecentUsers() {
  const recentUsers = await getRecentUsers({ limit: 5 });
  return recentUsers;
}

async function RecentReports() {
  const recentReports = await getRecentReports({ limit: 5 });
  return recentReports;
}

async function RecentActivity() {
  const recentActivity = await getRecentActivity({ limit: 8 });
  return recentActivity;
}

async function TrendingMetrics() {
  const trendingMetrics = await getTrendingMetrics();
  return trendingMetrics;
}

async function GeographicDistribution() {
  const geographicDistribution = await getGeographicDistribution();
  return geographicDistribution;
}

async function GenreBreakdown() {
  const genreBreakdown = await getGenreBreakdown();
  return genreBreakdown;
}

// Stat Card Component
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
  const range: DashboardRange =
    rangeParam === "30d" || rangeParam === "90d" ? rangeParam : "7d";

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <DashboardContent range={range} />
    </Suspense>
  );
}

async function DashboardContent({ range }: { range: DashboardRange }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Platform overview — live data from the database.
        </p>
      </div>

      {/* Alerts row — pending actions */}
      <Suspense
        fallback={
          <div className="h-12 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardAlerts range={range} />
      </Suspense>

      {/* Stats grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
          </div>
        }
      >
        <DashboardStatsGrid range={range} />
      </Suspense>

      {/* Content stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
          </div>
        }
      >
        <DashboardContentStats range={range} />
      </Suspense>

      {/* Operations stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
          </div>
        }
      >
        <DashboardOperationsStats range={range} />
      </Suspense>

      {/* Pending actions */}
      <Suspense
        fallback={
          <div className="h-24 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardPendingActions />
      </Suspense>

      {/* DJ Approval Queue */}
      <Suspense
        fallback={
          <div className="h-32 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardDJApprovalQueue />
      </Suspense>

      {/* Recent Users */}
      <Suspense
        fallback={
          <div className="h-40 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardRecentUsers />
      </Suspense>

      {/* Recent Reports */}
      <Suspense
        fallback={
          <div className="h-40 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardRecentReports />
      </Suspense>

      {/* Recent Activity */}
      <Suspense
        fallback={
          <div className="h-40 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardRecentActivity />
      </Suspense>

      {/* Trending Metrics */}
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-32 rounded-lg border border-white/10 bg-white/5" />
            <div className="h-32 rounded-lg border border-white/10 bg-white/5" />
          </div>
        }
      >
        <DashboardTrendingMetrics />
      </Suspense>

      {/* Geographic Distribution */}
      <Suspense
        fallback={
          <div className="h-40 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardGeographicDistribution />
      </Suspense>

      {/* Genre Breakdown */}
      <Suspense
        fallback={
          <div className="h-40 rounded-lg border border-white/10 bg-white/5" />
        }
      >
        <DashboardGenreBreakdown />
      </Suspense>
    </div>
  );
}

async function DashboardAlerts({ range }: { range: DashboardRange }) {
  const stats = await CachedDashboardStats({ range });

  if (
    stats.pendingDjApprovals === 0 &&
    stats.openReports === 0 &&
    stats.overdueHires === 0
  ) {
    return null;
  }

  return (
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
  );
}

async function DashboardStatsGrid({ range }: { range: DashboardRange }) {
  const stats = await CachedDashboardStats({ range });

  return (
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
  );
}

async function DashboardContentStats({ range }: { range: DashboardRange }) {
  const stats = await CachedDashboardStats({ range });

  return (
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
          label={`New Signups (${range})`}
          value={stats.newSignups}
          icon={<TrendingUp className="text-muted-foreground h-5 w-5" />}
        />
      </div>
    </div>
  );
}

async function DashboardOperationsStats({ range }: { range: DashboardRange }) {
  const stats = await CachedDashboardStats({ range });

  return (
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
            stats.overdueHires > 0 ? `${stats.overdueHires} overdue` : undefined
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
      </div>
    </div>
  );
}

async function DashboardPendingActions() {
  const stats = await CachedDashboardStats({ range: "7d" });

  if (stats.pendingDjApprovals === 0) {
    return null;
  }

  return (
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
  );
}

async function DashboardDJApprovalQueue() {
  const pendingApprovals = await CachedPendingApprovals();

  return (
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
            <p className="mt-3 text-sm font-medium text-white">
              No pending DJ approvals
            </p>
            <p className="mt-1 text-xs text-gray-500">
              All DJ profiles have been reviewed
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {pendingApprovals.map((dj) => (
              <div
                key={dj.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={dj.avatar ?? undefined}
                      alt={dj.stageName}
                    />
                    <AvatarFallback>{dj.stageName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{dj.stageName}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/djs/${dj.id}`}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

async function DashboardRecentUsers() {
  const recentUsers = await RecentUsers();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Users</h2>
          <p className="text-muted-foreground text-sm">
            Latest signups across the platform.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          View all users
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
        <div className="divide-y divide-white/5">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {(user.name ?? "U").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">
                    {user.name ?? user.email}
                  </p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DashboardRecentReports() {
  const recentReports = await RecentReports();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
          <p className="text-muted-foreground text-sm">
            Latest reports submitted by users.
          </p>
        </div>
        <Link
          href="/admin/reports"
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          View all reports
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
        <div className="divide-y divide-white/5">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
            >
              <div>
                <p className="font-medium text-white">{report.reason}</p>
                <p className="text-xs text-gray-400">{report.targetType}</p>
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(report.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DashboardRecentActivity() {
  const recentActivity = await RecentActivity();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">
            Latest admin actions across the platform.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
        <div className="divide-y divide-white/5">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
            >
              <div>
                <p className="font-medium text-white">{activity.title}</p>
                <p className="text-xs text-gray-400">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DashboardTrendingMetrics() {
  const trendingMetrics = await TrendingMetrics();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Trending Metrics</h2>
        <p className="text-muted-foreground text-sm">
          Key performance indicators over time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trendingMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-white/8 bg-white/3 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {metric.label}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs",
                  metric.trend === "up"
                    ? "text-emerald-400"
                    : metric.trend === "down"
                      ? "text-red-400"
                      : "text-gray-400",
                )}
              >
                {metric.trend === "up" && <TrendingUp className="h-3 w-3" />}
                {metric.trend === "down" && (
                  <TrendingDown className="h-3 w-3" />
                )}
                {metric.trend === "neutral" && <Minus className="h-3 w-3" />}
                {metric.change}
              </span>
            </div>
            <div className="h-16">
              <TrendingSparkline data={metric.data} trend={metric.trend} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

async function DashboardGeographicDistribution() {
  const geographicDistribution = await GeographicDistribution();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Geographic Distribution
        </h2>
        <p className="text-muted-foreground text-sm">
          User distribution by country.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
        <div className="divide-y divide-white/5">
          {geographicDistribution.map((item) => (
            <div
              key={item.country}
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
            >
              <span className="font-medium text-white">{item.country}</span>
              <span className="text-sm text-gray-400">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DashboardGenreBreakdown() {
  const genreBreakdown = await GenreBreakdown();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Genre Breakdown</h2>
        <p className="text-muted-foreground text-sm">
          DJ distribution by music genre.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
        <div className="divide-y divide-white/5">
          {genreBreakdown.map((item) => (
            <div
              key={item.genre}
              className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
            >
              <span className="font-medium text-white">{item.genre}</span>
              <span className="text-sm text-gray-400">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
