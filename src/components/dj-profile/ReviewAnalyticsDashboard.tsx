"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Calendar, Award, MessageSquare } from "lucide-react";

interface ReviewAnalyticsDashboardProps {
  totalReviews: number;
  averageRating: number;
  directCount: number;
  eventCount: number;
  gigCount: number;
  ratingDistribution: { rating: number; count: number }[];
  recentTrend: "up" | "down" | "stable";
  helpfulCount: number;
  reviewTypeBreakdown: {
    direct: number;
    eventAttendee: number;
    eventOrganizer: number;
    gigOrganizer: number;
  };
}

export function ReviewAnalyticsDashboard({
  totalReviews,
  averageRating,
  directCount,
  eventCount,
  gigCount,
  ratingDistribution,
  recentTrend,
  helpfulCount,
  reviewTypeBreakdown,
}: ReviewAnalyticsDashboardProps) {
  const maxCount = Math.max(...ratingDistribution.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-h_blackLight/30 border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Star className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-white">
                {averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-h_blackLight/30 border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-white">{totalReviews}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-h_blackLight/30 border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Award className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Helpful Votes</p>
              <p className="text-2xl font-bold text-white">{helpfulCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-h_blackLight/30 border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                recentTrend === "up"
                  ? "bg-emerald-500/10"
                  : recentTrend === "down"
                    ? "bg-red-500/10"
                    : "bg-gray-500/10"
              }`}
            >
              <TrendingUp
                className={`h-5 w-5 ${
                  recentTrend === "up"
                    ? "text-emerald-400"
                    : recentTrend === "down"
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400">Recent Trend</p>
              <p
                className={`text-sm font-bold capitalize ${
                  recentTrend === "up"
                    ? "text-emerald-400"
                    : recentTrend === "down"
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {recentTrend}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="bg-h_blackLight/30 border-white/5 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
          <Star className="h-4 w-4 text-amber-400" />
          Rating Distribution
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              ratingDistribution.find((r) => r.rating === rating)?.count || 0;
            const percentage = (count / totalReviews) * 100;
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-3 text-right text-xs text-gray-400">
                  {rating}
                </span>
                <Star className="h-3 w-3 shrink-0 text-amber-400" />
                <Progress
                  value={percentage}
                  className="h-2 flex-1 bg-white/8"
                />
                <span className="w-8 text-right text-xs text-gray-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Review Type Breakdown */}
      <Card className="bg-h_blackLight/30 border-white/5 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
          <Calendar className="h-4 w-4 text-blue-400" />
          Review Type Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Direct Reviews</span>
            <span className="text-sm font-medium text-white">
              {directCount} ({((directCount / totalReviews) * 100).toFixed(0)}%)
            </span>
          </div>
          <Progress
            value={(directCount / totalReviews) * 100}
            className="h-2 bg-white/8"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Event Attendee Reviews</span>
            <span className="text-sm font-medium text-white">
              {reviewTypeBreakdown.eventAttendee} (
              {((reviewTypeBreakdown.eventAttendee / totalReviews) * 100).toFixed(
                0,
              )}
              %)
            </span>
          </div>
          <Progress
            value={(reviewTypeBreakdown.eventAttendee / totalReviews) * 100}
            className="h-2 bg-white/8"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Event Organizer Reviews</span>
            <span className="text-sm font-medium text-white">
              {reviewTypeBreakdown.eventOrganizer} (
              {((reviewTypeBreakdown.eventOrganizer / totalReviews) * 100).toFixed(
                0,
              )}
              %)
            </span>
          </div>
          <Progress
            value={(reviewTypeBreakdown.eventOrganizer / totalReviews) * 100}
            className="h-2 bg-white/8"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Gig Organizer Reviews</span>
            <span className="text-sm font-medium text-white">
              {reviewTypeBreakdown.gigOrganizer} (
              {((reviewTypeBreakdown.gigOrganizer / totalReviews) * 100).toFixed(
                0,
              )}
              %)
            </span>
          </div>
          <Progress
            value={(reviewTypeBreakdown.gigOrganizer / totalReviews) * 100}
            className="h-2 bg-white/8"
          />
        </div>
      </Card>

      {/* Performance Insights */}
      <Card className="bg-h_blackLight/30 border-white/5 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Performance Insights
        </h3>
        <div className="space-y-3 text-sm">
          {averageRating >= 4.5 && (
            <div className="flex items-start gap-2 text-emerald-400">
              <Star className="h-4 w-4 shrink-0 fill-current" />
              <p>
                Excellent performance! Your ratings are consistently high across
                all review types.
              </p>
            </div>
          )}
          {eventCount > directCount && (
            <div className="flex items-start gap-2 text-blue-400">
              <Calendar className="h-4 w-4 shrink-0" />
              <p>
                Strong event presence! You have more event-anchored reviews
                than direct reviews, indicating good live performance.
              </p>
            </div>
          )}
          {helpfulCount > totalReviews * 0.5 && (
            <div className="flex items-start gap-2 text-emerald-400">
              <Award className="h-4 w-4 shrink-0" />
              <p>
                High helpfulness! More than half of your reviews are marked as
                helpful by the community.
              </p>
            </div>
          )}
          {recentTrend === "up" && (
            <div className="flex items-start gap-2 text-emerald-400">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <p>
                Positive momentum! Your recent reviews show an upward trend in
                ratings.
              </p>
            </div>
          )}
          {recentTrend === "down" && (
            <div className="flex items-start gap-2 text-amber-400">
              <TrendingUp className="h-4 w-4 shrink-0 rotate-180" />
              <p>
                Room for improvement. Recent reviews show a downward trend -
                consider gathering feedback.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
