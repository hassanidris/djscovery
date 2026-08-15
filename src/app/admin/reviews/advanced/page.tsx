import type { Metadata } from "next";
import { Suspense } from "react";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import AdvancedFeaturesContent from "./AdvancedFeaturesContent";

export const metadata: Metadata = { title: "Advanced Features" };

export default async function AdvancedFeaturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Advanced Features</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          ML-powered spam detection, duplicate analysis, sentiment analysis, and automated moderation
        </p>
      </div>

      <Suspense fallback={<AdminTableSkeleton cols={4} rows={4} />}>
        <AdvancedFeaturesData />
      </Suspense>
    </div>
  );
}

async function AdvancedFeaturesData() {
  const { getSpamStats } = await import("@/lib/actions/admin/spam-detection");
  const { getDuplicateStats } = await import("@/lib/actions/admin/duplicate-detection");
  const { getSentimentStats } = await import("@/lib/actions/admin/sentiment-analysis");
  const { getModerationQueueWithSuggestions } = await import(
    "@/lib/actions/admin/moderation-suggestions"
  );
  const { getReportReviewStats } = await import(
    "@/lib/actions/admin/report-review-integration"
  );

  const [spamStats, duplicateStats, sentimentStats, moderationQueue, reportStats] =
    await Promise.all([
      getSpamStats(),
      getDuplicateStats(),
      getSentimentStats(30),
      getModerationQueueWithSuggestions(20, 30),
      getReportReviewStats(),
    ]);

  return (
    <AdvancedFeaturesContent
      spamStats={spamStats}
      duplicateStats={duplicateStats}
      sentimentStats={sentimentStats}
      moderationQueue={moderationQueue}
      reportStats={reportStats}
    />
  );
}