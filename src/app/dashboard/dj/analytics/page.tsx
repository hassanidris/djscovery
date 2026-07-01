import { redirect } from "next/navigation";
import {
  Eye,
  Handshake,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Globe,
  BarChart3,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { getProfileStats } from "@/lib/actions/dj-analytics";
import { cn } from "@/lib/utils";

export const metadata = { title: "Analytics — DJcovery" };

/* ─── helpers ─── */
function GrowthBadge({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400">
        <TrendingUp className="h-3 w-3" />+{value}%
      </span>
    );
  if (value < 0)
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-red-400">
        <TrendingDown className="h-3 w-3" />
        {value}%
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-gray-500">
      <Minus className="h-3 w-3" />
      0%
    </span>
  );
}

function StatCard({
  label,
  value,
  growth,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  growth: number;
  icon: React.ElementType;
}) {
  return (
    <Card className="bg-h_blackLight/40 gap-0 border-white/8 p-5">
      <div className="mb-3 flex items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        <GrowthBadge value={growth} />
      </div>
    </Card>
  );
}

function ProgressBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-gray-400">{label}</span>
      <Progress value={pct} className="h-1.5 flex-1 bg-white/8" />
      <span className="w-8 text-right text-xs text-gray-500">{value}</span>
    </div>
  );
}

/* ─── page ─── */
export default async function DjAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const dj = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, plan: true, stageName: true, slug: true },
  });
  if (!dj) redirect("/become-dj");

  const stats = await getProfileStats(dj.id);
  const isPremium = dj.plan === "PREMIUM";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              Performance Analytics
            </h1>
            <p className="text-xs text-gray-500">
              Last 30 days · Updated in real-time
            </p>
          </div>
          {dj.slug && (
            <a
              href={`/djs/${dj.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-h_red flex items-center gap-1 text-xs hover:underline"
            >
              View public profile
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>

        {!isPremium && (
          <Card className="mb-8 gap-0 border-amber-500/20 bg-amber-500/10 p-6">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Analytics are a Premium feature
                </p>
                <p className="text-xs text-amber-400/70">
                  Upgrade to Premium to unlock detailed profile analytics,
                  audience insights, and booking performance tracking.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isPremium && !stats && (
          <Card className="bg-h_blackLight/40 gap-0 border-white/8 p-6">
            <p className="text-sm text-gray-400">
              No analytics data yet. Profile views and booking activity will
              appear here once fans and organizers start interacting with your
              profile.
            </p>
          </Card>
        )}

        {isPremium && stats && (
          <>
            {/* Stat cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Profile Views"
                value={stats.profileViews.value.toLocaleString()}
                growth={stats.profileViews.growth}
                icon={Eye}
              />
              <StatCard
                label="Booking Requests"
                value={stats.bookingRequests.value}
                growth={stats.bookingRequests.growth}
                icon={Handshake}
              />
              <StatCard
                label="New Followers"
                value={stats.newFollowers.value}
                growth={stats.newFollowers.growth}
                icon={Users}
              />
              <StatCard
                label="Booking Rate"
                value={`${stats.bookingRate}%`}
                growth={0}
                icon={BarChart3}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Cities */}
              <Card className="bg-h_blackLight/40 gap-0 border-white/8 p-6">
                <div className="mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-white">
                    Top Cities
                  </h2>
                </div>
                <p className="mb-4 text-xs text-gray-500">
                  Where your audience is coming from
                </p>
                {stats.topCities.length === 0 ? (
                  <p className="text-xs text-gray-600">
                    No city data yet. Views will be geo-located as your profile
                    gains traction.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const max = Math.max(
                        ...stats.topCities.map(
                          (c: { city: string; percentage: number }) =>
                            c.percentage,
                        ),
                        1,
                      );
                      return stats.topCities.map(
                        (c: { city: string; percentage: number }) => (
                          <ProgressBar
                            key={c.city}
                            label={c.city}
                            value={c.percentage}
                            max={max}
                          />
                        ),
                      );
                    })()}
                  </div>
                )}
              </Card>

              {/* Traffic Sources */}
              <Card className="bg-h_blackLight/40 gap-0 border-white/8 p-6">
                <div className="mb-1 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-white">
                    Traffic Sources
                  </h2>
                </div>
                <p className="mb-4 text-xs text-gray-500">
                  How fans discover your profile
                </p>
                {stats.trafficSources.length === 0 ? (
                  <p className="text-xs text-gray-600">
                    No source data yet. Traffic sources are tracked once
                    visitors start landing on your profile.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const max = Math.max(
                        ...stats.trafficSources.map(
                          (s: { source: string; percentage: number }) =>
                            s.percentage,
                        ),
                        1,
                      );
                      return stats.trafficSources.map(
                        (s: { source: string; percentage: number }) => (
                          <ProgressBar
                            key={s.source}
                            label={s.source}
                            value={s.percentage}
                            max={max}
                          />
                        ),
                      );
                    })()}
                  </div>
                )}
              </Card>
            </div>

            {/* Quick tips */}
            <Card className="bg-h_blackLight/40 mt-6 gap-0 border-white/8 p-6">
              <h2 className="mb-3 text-sm font-semibold text-white">
                Tips to grow your profile
              </h2>
              <ul className="flex flex-col gap-2">
                {[
                  "Keep your availability calendar up to date so organizers can see when you're free.",
                  "Add press items and endorsements to build social proof on your premium profile.",
                  "Share your DJcovery profile link on social media to drive direct traffic.",
                  "Respond to booking inquiries quickly — a fast response rate improves your reputation score.",
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-400"
                  >
                    <span className="bg-h_red/15 text-h_red mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
