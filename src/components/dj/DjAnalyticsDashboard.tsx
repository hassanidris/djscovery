"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Video,
  ArrowUpRight,
  Music2,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  DailyCount,
  BookingStatusCount,
  TopMediaItem,
  ProfileViewSource,
  TopCity,
} from "@/lib/queries/dj-stats";
import { hasFeature, type DjPlanTier } from "@/lib/plan-features";

// Lazy-load the recharts-based charts so the chart library is only bundled
// for the analytics dashboard route, not for every page that imports from
// this component tree.
const AnalyticsCharts = dynamic(
  () =>
    import("@/components/dj/analytics-charts/AnalyticsCharts").then(
      (m) => m.AnalyticsCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-white/10 bg-white/5">
            <CardContent className="flex h-72 items-center justify-center">
              <div className="h-6 w-6 animate-pulse rounded-full border-2 border-white/20 border-t-white/60" />
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  },
);

function formatNumber(value: number) {
  return value.toLocaleString();
}

type Props = {
  slug: string | null;
  plan: DjPlanTier;
  totals: {
    followers: number;
    bookings: number;
    profileViews: number;
    mediaPlays: number;
    mediaViews: number;
    responseRate: number;
    bookingRate: number;
  };
  viewsOverTime: DailyCount[];
  followersOverTime: DailyCount[];
  bookingsByStatus: BookingStatusCount[];
  topMedia: TopMediaItem[];
  sources: ProfileViewSource[];
  topCities: TopCity[];
};

export default function DjAnalyticsDashboard({
  slug,
  plan,
  totals,
  viewsOverTime,
  followersOverTime,
  bookingsByStatus,
  topMedia,
  sources,
  topCities,
}: Props) {
  const hasAdvancedAnalytics = hasFeature(plan, "advancedAnalyticsAccess");
  const totalViews = viewsOverTime.reduce((sum, d) => sum + d.count, 0);
  const totalFollowers = followersOverTime.reduce((sum, d) => sum + d.count, 0);
  const hasData =
    totalViews > 0 ||
    totalFollowers > 0 ||
    bookingsByStatus.length > 0 ||
    topMedia.length > 0 ||
    sources.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Analytics</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Track your profile and content performance over the last{" "}
            {hasAdvancedAnalytics ? "30" : "7"} days
          </p>
        </div>
        {slug && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/djs/${slug}`} target="_blank">
              <ArrowUpRight className="h-4 w-4" />
              View Public Profile
            </Link>
          </Button>
        )}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card size="sm" className="flex flex-col justify-end">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatNumber(totals.profileViews)}
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col justify-end">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatNumber(totals.followers)}
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col justify-end">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatNumber(totals.bookings)}
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col justify-end">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.responseRate}%</p>
          </CardContent>
        </Card>

        <Card size="sm" className="flex flex-col justify-end">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Booking Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totals.bookingRate}%</p>
          </CardContent>
        </Card>
      </div>

      {!hasData && (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="py-12 text-center">
            <TrendingUp className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <h3 className="text-base font-semibold text-white">
              No analytics yet
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              As fans view your profile and interact with your media, insights
              will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <>
          <Separator />

          {/* Charts row - only show advanced charts for PREMIUM.
              recharts is lazy-loaded inside AnalyticsCharts so it only
              ships to this route, not to every page. */}
          {hasAdvancedAnalytics ? (
            <AnalyticsCharts
              viewsOverTime={viewsOverTime}
              followersOverTime={followersOverTime}
              bookingsByStatus={bookingsByStatus}
              sources={sources}
              topCities={topCities}
            />
          ) : (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="py-12 text-center">
                <TrendingUp className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <h3 className="text-base font-semibold text-white">
                  Upgrade to Premium for Advanced Analytics
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Get detailed charts, 30-day trends, and demographic insights
                </p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Top media - available for all plans */}
          <section>
            <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
              Top Performing Media
            </h3>
            {topMedia.length === 0 ? (
              <Card className="border-white/10 bg-white/5">
                <CardContent className="py-8 text-center">
                  <Music2 className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                  <p className="text-muted-foreground text-sm">
                    Upload mixes and videos to see what performs best
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topMedia.map((item) => (
                  <Card key={item.id} className="border-white/10 bg-white/5">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="bg-muted relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt=""
                            fill
                            sizes="56px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : item.type === "AUDIO" ? (
                          <Music2 className="text-muted-foreground h-6 w-6" />
                        ) : (
                          <Video className="text-muted-foreground h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.title ||
                            (item.type === "AUDIO"
                              ? "Untitled mix"
                              : "Untitled video")}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            {item.type === "AUDIO" ? (
                              <>
                                <Play className="h-3 w-3" />
                                {formatNumber(item.plays)} plays
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" />
                                {formatNumber(item.views)} views
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
