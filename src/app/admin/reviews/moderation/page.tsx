import type { Metadata } from "next";
import { Suspense } from "react";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import ModerationContentClient from "./ModerationContentClient";

export const metadata: Metadata = { title: "Review Moderation" };

export default async function ReviewModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          AI-powered suspicious review detection and moderation queue
        </p>
      </div>

      <Suspense fallback={<AdminTableSkeleton cols={4} rows={4} />}>
        <ModerationContent />
      </Suspense>
    </div>
  );
}

async function ModerationContent() {
  const { getModerationQueue, getModerationStats } =
    await import("@/lib/actions/admin/review-moderation");
  const [queue, stats] = await Promise.all([
    getModerationQueue(20),
    getModerationStats(),
  ]);

  return <ModerationContentClient queue={queue} stats={stats} />;
}
