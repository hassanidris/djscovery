"use client";

import {
  Eye,
  Users,
  Handshake,
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
import type {
  DailyCount,
  BookingStatusCount,
  ProfileViewSource,
  TopCity,
} from "@/lib/queries/dj-stats";

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

type AnalyticsChartsProps = {
  viewsOverTime: DailyCount[];
  followersOverTime: DailyCount[];
  bookingsByStatus: BookingStatusCount[];
  sources: ProfileViewSource[];
  topCities: TopCity[];
};

export function AnalyticsCharts({
  viewsOverTime,
  followersOverTime,
  bookingsByStatus,
  sources,
  topCities,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Profile views over time */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
            <Eye className="text-h_redLight h-4 w-4" />
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
            <Users className="text-h_redLight h-4 w-4" />
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
            <Handshake className="text-h_redLight h-4 w-4" />
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
            <TrendingUp className="text-h_redLight h-4 w-4" />
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
            <MapPin className="text-h_redLight h-4 w-4" />
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
  );
}

export default AnalyticsCharts;
