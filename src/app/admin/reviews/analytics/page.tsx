import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Star,
  MessageSquare,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { getReviewAnalytics } from "@/lib/actions/admin/review-analytics";
import { StatCard } from "@/components/admin/analytics/StatCard";
import { RatingDistributionChart } from "@/components/admin/analytics/RatingDistributionChart";
import { TimeSeriesChart } from "@/components/admin/analytics/TimeSeriesChart";
import { ProgressBar } from "@/components/admin/analytics/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

export const metadata: Metadata = { title: "Review Analytics" };

type TimeRange = "7d" | "30d" | "90d";

export default async function ReviewAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const timeRange: TimeRange = (params.range as TimeRange) || "30d";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive insights into review quality and patterns
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              className={`cursor-pointer ${
                timeRange === range
                  ? "bg-h_red/20 text-h_redLight border-h_red/30 border"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {range.toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>

      <Suspense fallback={<AdminTableSkeleton cols={4} rows={4} />}>
        <AnalyticsContent timeRange={timeRange} />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent({ timeRange }: { timeRange: TimeRange }) {
  const analytics = await getReviewAnalytics(timeRange);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={analytics.overview.totalReviews}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          label="Average Rating"
          value={analytics.overview.averageRating.toFixed(1)}
          icon={Star}
          color="amber"
        />
        <StatCard
          label="DJs Reviewed"
          value={analytics.overview.totalDjsReviewed}
          icon={Users}
          color="green"
        />
        <StatCard
          label="Active Reviewers"
          value={analytics.overview.totalReviewers}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Moderation Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending Moderation"
          value={analytics.overview.pendingModeration}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Flagged Reviews"
          value={analytics.overview.flaggedReviews}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Hidden Reviews"
          value={analytics.overview.hiddenReviews}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Quality Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Star className="h-5 w-5 text-amber-400" />
            Rating Distribution
          </h3>
          <RatingDistributionChart
            data={analytics.qualityMetrics.ratingDistribution}
            total={analytics.overview.totalReviews}
          />
        </Card>

        <Card className="border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Helpfulness Stats
          </h3>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-300">Total Helpful Votes</span>
                <span className="font-medium text-white">
                  {analytics.qualityMetrics.helpfulnessStats.totalHelpfulVotes}
                </span>
              </div>
              <ProgressBar
                value={analytics.qualityMetrics.helpfulnessStats.totalHelpfulVotes}
                max={Math.max(
                  analytics.qualityMetrics.helpfulnessStats.totalHelpfulVotes,
                  100,
                )}
                color="green"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-300">Avg Helpful per Review</span>
                <span className="font-medium text-white">
                  {analytics.qualityMetrics.helpfulnessStats.averageHelpfulPerReview.toFixed(
                    1,
                  )}
                </span>
              </div>
              <ProgressBar
                value={analytics.qualityMetrics.helpfulnessStats.averageHelpfulPerReview}
                max={10}
                color="blue"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-300">Most Helpful Review</span>
                <span className="font-medium text-white">
                  {analytics.qualityMetrics.helpfulnessStats.mostHelpfulReviews}
                </span>
              </div>
              <ProgressBar
                value={analytics.qualityMetrics.helpfulnessStats.mostHelpfulReviews}
                max={Math.max(
                  analytics.qualityMetrics.helpfulnessStats.mostHelpfulReviews,
                  10,
                )}
                color="amber"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Review Length Stats */}
      <Card className="border-white/8 bg-white/3 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Review Content Analysis
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">Average Length</p>
            <p className="text-2xl font-bold text-white">
              {analytics.qualityMetrics.reviewLengthStats.averageLength.toFixed(
                0,
              )}
            </p>
            <p className="text-muted-foreground text-xs">characters</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">With Text</p>
            <p className="text-2xl font-bold text-white">
              {analytics.qualityMetrics.reviewLengthStats.withText}
            </p>
            <p className="text-muted-foreground text-xs">
              {(
                (analytics.qualityMetrics.reviewLengthStats.withText /
                  analytics.overview.totalReviews) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Rating Only</p>
            <p className="text-2xl font-bold text-white">
              {analytics.qualityMetrics.reviewLengthStats.withoutText}
            </p>
            <p className="text-muted-foreground text-xs">
              {(
                (analytics.qualityMetrics.reviewLengthStats.withoutText /
                  analytics.overview.totalReviews) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      </Card>

      {/* Reviewer Patterns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-purple-400" />
            Top Reviewers
          </h3>
          <div className="space-y-3">
            {analytics.reviewerPatterns.topReviewers.map((reviewer, index) => (
              <div
                key={reviewer.userId}
                className="flex items-center justify-between rounded-lg bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{reviewer.username}</p>
                    <p className="text-muted-foreground text-xs">
                      {reviewer.reviewCount} reviews
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-white">
                    {reviewer.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <PieChart className="h-5 w-5 text-blue-400" />
            Review Type Distribution
          </h3>
          <div className="space-y-3">
            {analytics.reviewerPatterns.reviewTypeDistribution.map((type) => (
              <div key={type.type}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-300">{type.type}</span>
                  <span className="font-medium text-white">
                    {type.count} ({type.percentage.toFixed(1)}%)
                  </span>
                </div>
                <ProgressBar
                  value={type.percentage}
                  color="blue"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* DJ Response Metrics */}
      <Card className="border-white/8 bg-white/3 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Activity className="h-5 w-5 text-emerald-400" />
          DJ Response Metrics
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-sm">Response Rate</p>
            <p className="text-2xl font-bold text-white">
              {analytics.djResponseMetrics.overallResponseRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Avg Response Time</p>
            <p className="text-2xl font-bold text-white">
              {analytics.djResponseMetrics.averageResponseTime.toFixed(1)}h
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">DJs Responded</p>
            <p className="text-2xl font-bold text-white">
              {analytics.djResponseMetrics.respondedDjs}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total DJs with Reviews</p>
            <p className="text-2xl font-bold text-white">
              {analytics.djResponseMetrics.totalDjsWithReviews}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-gray-300">
            Response Time Distribution
          </h4>
          <div className="grid gap-3 sm:grid-cols-4">
            {analytics.djResponseMetrics.responseTimeDistribution.map((time) => (
              <div key={time.range}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-gray-400">{time.range}</span>
                  <span className="font-medium text-white">{time.count}</span>
                </div>
                <ProgressBar
                  value={time.count}
                  max={Math.max(
                    ...analytics.djResponseMetrics.responseTimeDistribution.map(
                      (t) => t.count,
                    ),
                    1,
                  )}
                  color="green"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Review Growth
          </h3>
          <TimeSeriesChart
            data={analytics.trends.reviewGrowth.map((t) => ({
              period: t.period,
              value: t.count,
            }))}
            color="blue"
          />
        </Card>

        <Card className="border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Star className="h-5 w-5 text-amber-400" />
            Rating Trend
          </h3>
          <TimeSeriesChart
            data={analytics.trends.ratingTrend.map((t) => ({
              period: t.period,
              value: t.averageRating,
            }))}
            color="amber"
          />
        </Card>
      </div>

      {/* Moderation Actions */}
      <Card className="border-white/8 bg-white/3 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          Moderation Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {analytics.trends.moderationActions.map((action) => (
            <div
              key={action.action}
              className="rounded-lg bg-white/5 p-4 text-center"
            >
              <p className="text-2xl font-bold text-white">{action.count}</p>
              <p className="text-muted-foreground mt-1 text-sm">{action.action}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}