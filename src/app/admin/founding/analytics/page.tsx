import type { Metadata } from "next";
import Link from "next/link";
import { getFoundingAnalytics } from "@/lib/actions/admin/founding-analytics";
import {
  Users,
  CheckCircle,
  TrendingUp,
  Clock,
  MapPin,
  Target,
  BarChart3,
} from "lucide-react";

export const metadata: Metadata = { title: "Founding Analytics" };

function MetricCard({
  label,
  value,
  icon,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
    </div>
  );
}

function DistributionList({
  title,
  items,
  icon,
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
  icon: React.ReactNode;
}) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <section className="rounded-xl border border-white/8 bg-white/2 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
        {icon}
        {title}
      </h3>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.name} className="space-y-1">
              <div className="flex justify-between gap-3 text-xs">
                <span className="truncate text-gray-400">{item.name}</span>
                <span className="font-medium text-white">{item.count}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5">
                <div
                  className="bg-h_red h-full rounded-full"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">No data yet.</p>
      )}
    </section>
  );
}

export default async function AdminFoundingAnalyticsPage() {
  const analytics = await getFoundingAnalytics();

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
            Founding program
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Funnel metrics, conversion rates, and attribution data.
          </p>
        </div>
        <Link
          href="/admin/founding"
          className="text-sm text-gray-400 hover:text-white"
        >
          Founding overview
        </Link>
      </header>

      {/* Funnel metrics */}
      <section>
        <h2 className="mb-4 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Funnel
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard
            label="Waitlist"
            value={analytics.funnel.waitlist}
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            label="Applications"
            value={analytics.funnel.applications}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <MetricCard
            label="Approved"
            value={analytics.funnel.approved}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <MetricCard
            label="Active Members"
            value={analytics.funnel.active}
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* Conversion rates */}
      <section>
        <h2 className="mb-4 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Conversion Rates
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard
            label="Acceptance Rate"
            value={`${analytics.rates.acceptanceRate}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            subtext="Approved / Reviewed"
          />
          <MetricCard
            label="Onboarding Rate"
            value={`${analytics.rates.onboardingRate}%`}
            icon={<CheckCircle className="h-4 w-4" />}
            subtext="Active / Approved"
          />
          <MetricCard
            label="Avg Time to Approve"
            value={
              analytics.timing.avgTimeToApprove
                ? `${analytics.timing.avgTimeToApprove}d`
                : "—"
            }
            icon={<Clock className="h-4 w-4" />}
            subtext="Days from submit to approve"
          />
          <MetricCard
            label="Avg Time to Onboard"
            value={
              analytics.timing.avgTimeToOnboard
                ? `${analytics.timing.avgTimeToOnboard}d`
                : "—"
            }
            icon={<Clock className="h-4 w-4" />}
            subtext="Days from approve to launch"
          />
        </div>
      </section>

      {/* Geographic distribution */}
      <section className="grid gap-3 md:grid-cols-2">
        <DistributionList
          title="By Country"
          items={analytics.byCountry}
          icon={<MapPin className="h-4 w-4" />}
        />
        <DistributionList
          title="By City"
          items={analytics.byCity}
          icon={<MapPin className="h-4 w-4" />}
        />
      </section>

      {/* UTM attribution */}
      <section className="grid gap-3 md:grid-cols-2">
        <DistributionList
          title="UTM Sources"
          items={analytics.utmSources.map((item) => ({
            name: item.source,
            count: Number(item.count),
          }))}
          icon={<Target className="h-4 w-4" />}
        />
        <DistributionList
          title="UTM Campaigns"
          items={analytics.utmCampaigns.map((item) => ({
            name: item.campaign,
            count: Number(item.count),
          }))}
          icon={<Target className="h-4 w-4" />}
        />
      </section>
    </div>
  );
}
