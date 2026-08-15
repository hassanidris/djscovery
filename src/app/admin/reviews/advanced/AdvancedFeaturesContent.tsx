"use client";

import { useState } from "react";
import {
  Shield,
  Copy,
  Smile,
  Zap,
  Flag,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdvancedFeaturesContentProps {
  spamStats: any;
  duplicateStats: any;
  sentimentStats: any;
  moderationQueue: any;
  reportStats: any;
}

export default function AdvancedFeaturesContent({
  spamStats,
  duplicateStats,
  sentimentStats,
  moderationQueue,
  reportStats,
}: AdvancedFeaturesContentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "border-h_redLight border-b-2 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("spam")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "spam"
              ? "border-h_redLight border-b-2 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Spam Detection
        </button>
        <button
          onClick={() => setActiveTab("duplicates")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "duplicates"
              ? "border-h_redLight border-b-2 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Duplicates
        </button>
        <button
          onClick={() => setActiveTab("sentiment")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "sentiment"
              ? "border-h_redLight border-b-2 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Sentiment
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "suggestions"
              ? "border-h_redLight border-b-2 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "reports"
              ? "border-h_redLight border-b-2 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Reports
        </button>
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          spamStats={spamStats}
          duplicateStats={duplicateStats}
          sentimentStats={sentimentStats}
          moderationQueue={moderationQueue}
          reportStats={reportStats}
        />
      )}
      {activeTab === "spam" && <SpamTab spamStats={spamStats} />}
      {activeTab === "duplicates" && (
        <DuplicatesTab duplicateStats={duplicateStats} />
      )}
      {activeTab === "sentiment" && (
        <SentimentTab sentimentStats={sentimentStats} />
      )}
      {activeTab === "suggestions" && (
        <SuggestionsTab moderationQueue={moderationQueue} />
      )}
      {activeTab === "reports" && <ReportsTab reportStats={reportStats} />}
    </div>
  );
}

function OverviewTab({
  spamStats,
  duplicateStats,
  sentimentStats,
  moderationQueue,
  reportStats,
}: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {spamStats.detectedSpam}
              </p>
              <p className="text-muted-foreground text-xs">Spam Detected</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Copy className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {duplicateStats.detectedDuplicates}
              </p>
              <p className="text-muted-foreground text-xs">Duplicates</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Smile className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {sentimentStats.positiveCount}
              </p>
              <p className="text-muted-foreground text-xs">Positive</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {moderationQueue.stats.total}
              </p>
              <p className="text-muted-foreground text-xs">Suggestions</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Moderation Suggestions Queue
        </h2>
        <div className="space-y-4">
          {moderationQueue.suggestions.slice(0, 5).map((suggestion: any) => (
            <div
              key={suggestion.reviewId}
              className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      suggestion.priority === "critical"
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : suggestion.priority === "high"
                          ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                          : "border-white/10 bg-white/5 text-gray-400"
                    }
                  >
                    {suggestion.priority.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/5 text-xs text-gray-400"
                  >
                    {suggestion.suggestedAction.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {suggestion.confidence.toFixed(2)} confidence
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {suggestion.reasons.join(", ")}
                </p>
              </div>
              <a
                href={`/admin/reviews/${suggestion.reviewId}`}
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Review
              </a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SpamTab({ spamStats }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {spamStats.detectedSpam}
              </p>
              <p className="text-muted-foreground text-xs">Spam Reviews</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {spamStats.avgConfidence.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-xs">Avg Confidence</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Spam by Type</h2>
        <div className="space-y-4">
          {Object.entries(spamStats.spamByType).map(([type, count]) => (
            <div
              key={type}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <span className="font-medium text-white capitalize">{type}</span>
              <Badge
                variant="outline"
                className="border-white/10 bg-white/5 text-gray-400"
              >
                {count as number}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DuplicatesTab({ duplicateStats }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Copy className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {duplicateStats.detectedDuplicates}
              </p>
              <p className="text-muted-foreground text-xs">Duplicates</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {duplicateStats.avgSimilarity.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-xs">Avg Similarity</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Duplicates by Type
        </h2>
        <div className="space-y-4">
          {Object.entries(duplicateStats.duplicatesByType).map(
            ([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="font-medium text-white capitalize">
                  {type}
                </span>
                <Badge
                  variant="outline"
                  className="border-white/10 bg-white/5 text-gray-400"
                >
                  {count as number}
                </Badge>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}

function SentimentTab({ sentimentStats }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {sentimentStats.positiveCount}
              </p>
              <p className="text-muted-foreground text-xs">Positive</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {sentimentStats.neutralCount}
              </p>
              <p className="text-muted-foreground text-xs">Neutral</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {sentimentStats.negativeCount}
              </p>
              <p className="text-muted-foreground text-xs">Negative</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {sentimentStats.avgScore.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-xs">Avg Score</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Sentiment by Rating
        </h2>
        <div className="space-y-4">
          {Object.entries(sentimentStats.sentimentByRating).map(
            ([rating, data]) => (
              <div
                key={rating}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="font-medium text-white">{rating} stars</span>
                <div className="flex gap-2">
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    +{(data as any).positive}
                  </Badge>
                  <Badge className="border-gray-500/30 bg-gray-500/10 text-gray-400">
                    {(data as any).neutral}
                  </Badge>
                  <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
                    -{(data as any).negative}
                  </Badge>
                </div>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}

function SuggestionsTab({ moderationQueue }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {moderationQueue.stats.total}
              </p>
              <p className="text-muted-foreground text-xs">Total Suggestions</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {moderationQueue.stats.avgConfidence.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-xs">Avg Confidence</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Suggestions by Action
        </h2>
        <div className="space-y-4">
          {Object.entries(moderationQueue.stats.byAction).map(
            ([action, count]) => (
              <div
                key={action}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="font-medium text-white capitalize">
                  {action}
                </span>
                <Badge
                  variant="outline"
                  className="border-white/10 bg-white/5 text-gray-400"
                >
                  {count as number}
                </Badge>
              </div>
            ),
          )}
        </div>
      </Card>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Suggestions by Priority
        </h2>
        <div className="space-y-4">
          {Object.entries(moderationQueue.stats.byPriority).map(
            ([priority, count]) => (
              <div
                key={priority}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="font-medium text-white capitalize">
                  {priority}
                </span>
                <Badge
                  variant="outline"
                  className={
                    priority === "critical"
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : priority === "high"
                        ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                        : "border-white/10 bg-white/5 text-gray-400"
                  }
                >
                  {count as number}
                </Badge>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}

function ReportsTab({ reportStats }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Flag className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reportStats.reviewReports}
              </p>
              <p className="text-muted-foreground text-xs">Review Reports</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reportStats.resolvedReports}
              </p>
              <p className="text-muted-foreground text-xs">Resolved</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reportStats.autoResolvedReports}
              </p>
              <p className="text-muted-foreground text-xs">Auto-Resolved</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {reportStats.avgResolutionTime.toFixed(1)}h
              </p>
              <p className="text-muted-foreground text-xs">Avg Resolution</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Reports by Reason
        </h2>
        <div className="space-y-4">
          {Object.entries(reportStats.byReason).map(([reason, count]) => (
            <div
              key={reason}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <span className="font-medium text-white">{reason}</span>
              <Badge
                variant="outline"
                className="border-white/10 bg-white/5 text-gray-400"
              >
                {count as number}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
