"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  Users,
  Handshake,
  Play,
  Video,
  ArrowUpRight,
  Music2,
  TrendingUp,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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

const BRAND_RED = "#d30101";
const BRAND_RED_DARK = "#a80000";
const GRAY = "#6b7280";
const GRID = "rgba(255,255,255,0.08)";

const CHART_COLORS = ["#d30101", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  search: "Search",
  social: "Social",
  referral: "Referral",
};

function formatDate(value: string) {
  return value.slice(5); // MM-DD
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-lg">
        <p className="mb-1 text-gray-400">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-medium">
            {formatNumber(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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

          {/* Charts row - only show advanced charts for PREMIUM */}
          {hasAdvancedAnalytics ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Profile views over time */}
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Eye className="text-h_red/80 h-4 w-4" />
                    Profile Views (30 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={viewsOverTime}>
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: GRAY, fontSize: 11 }}
                          tickFormatter={formatDate}
                          axisLine={{ stroke: GRID }}
                          tickLine={false}
                          minTickGap={24}
                        />
                        <YAxis
                          tick={{ fill: GRAY, fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={BRAND_RED}
                          strokeWidth={2}
                          dot={{ r: 3, fill: BRAND_RED, strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: BRAND_RED }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Follower growth over time */}
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Users className="text-h_red/80 h-4 w-4" />
                    New Followers (30 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={followersOverTime}>
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: GRAY, fontSize: 11 }}
                          tickFormatter={formatDate}
                          axisLine={{ stroke: GRID }}
                          tickLine={false}
                          minTickGap={24}
                        />
                        <YAxis
                          tick={{ fill: GRAY, fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={BRAND_RED_DARK}
                          strokeWidth={2}
                          dot={{ r: 3, fill: BRAND_RED_DARK, strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: BRAND_RED_DARK }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Booking status breakdown */}
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Handshake className="text-h_red/80 h-4 w-4" />
                    Booking Requests by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsByStatus.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                      No booking requests yet
                    </p>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookingsByStatus}>
                          <CartesianGrid stroke={GRID} vertical={false} />
                          <XAxis
                            dataKey="status"
                            tickFormatter={(v) => STATUS_LABELS[v] || v}
                            tick={{ fill: GRAY, fontSize: 11 }}
                            axisLine={{ stroke: GRID }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: GRAY, fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-md border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-lg">
                                    <p className="text-gray-400">
                                      {STATUS_LABELS[String(label)] || label}
                                    </p>
                                    <p className="font-medium">
                                      {payload[0].value}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {bookingsByStatus.map((_, i) => (
                              <Cell
                                key={`cell-${i}`}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Traffic sources */}
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <TrendingUp className="text-h_red/80 h-4 w-4" />
                    Profile View Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sources.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                      No source data yet
                    </p>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sources}
                            dataKey="count"
                            nameKey="source"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(props) => {
                              const source = String(props.name ?? "");
                              const count = Number(props.value ?? 0);
                              return `${SOURCE_LABELS[source] || source}: ${count}`;
                            }}
                            labelLine={false}
                          >
                            {sources.map((_, i) => (
                              <Cell
                                key={`cell-${i}`}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Legend
                            verticalAlign="bottom"
                            height={24}
                            formatter={(value) => (
                              <span className="text-xs text-gray-400">
                                {SOURCE_LABELS[value] || value}
                              </span>
                            )}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const p = payload[0];
                                const source = String(p.name);
                                return (
                                  <div className="rounded-md border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-lg">
                                    <p className="text-gray-400">
                                      {SOURCE_LABELS[source] || source}
                                    </p>
                                    <p className="font-medium">{p.value}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Cities — audience location from profile views */}
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MapPin className="text-h_red/80 h-4 w-4" />
                    Top Cities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topCities.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                      No location data yet
                    </p>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topCities} layout="vertical">
                          <CartesianGrid stroke={GRID} horizontal={false} />
                          <XAxis
                            type="number"
                            tick={{ fill: GRAY, fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="city"
                            tick={{ fill: GRAY, fontSize: 11 }}
                            axisLine={{ stroke: GRID }}
                            tickLine={false}
                            width={80}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const item = payload[0].payload as TopCity;
                                return (
                                  <div className="rounded-md border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-lg">
                                    <p className="text-gray-400">
                                      {label}, {item.country}
                                    </p>
                                    <p className="font-medium">
                                      {payload[0].value} views
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {topCities.map((_, i) => (
                              <Cell
                                key={`cell-${i}`}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
