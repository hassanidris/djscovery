import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Disc3,
  Building2,
  UserCircle,
  Briefcase,
  CalendarDays,
  Flag,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions/admin/stats";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Dashboard" };

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
      className={`group flex flex-col gap-4 rounded-xl border p-5 transition-colors ${
        accent
          ? "border-h_red/30 bg-h_red/5 hover:bg-h_red/10"
          : "border-white/8 bg-white/3 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            accent ? "bg-h_red/10" : "bg-white/5"
          }`}
        >
          {icon}
        </div>
        {badge && (
          <Badge className="border-h_red/30 bg-h_red/10 text-h_red border text-xs">
            {badge}
          </Badge>
        )}
        {href && !badge && (
          <ArrowRight className="h-4 w-4 text-gray-600 transition-colors group-hover:text-gray-400" />
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{label}</p>
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

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

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
      {(stats.pendingDjApprovals > 0 || stats.openReports > 0) && (
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
    </div>
  );
}
