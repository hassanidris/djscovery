"use client";

import { Suspense, useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  bulkApproveReviews,
  bulkHideReviews,
  bulkFlagReviews,
  bulkDeleteReviews,
} from "@/lib/actions/admin-review-management";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_COLORS = {
  low: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  high: "border-red-500/30 bg-red-500/10 text-red-400",
};

const SEVERITY_ICONS = {
  low: Clock,
  medium: AlertTriangle,
  high: XCircle,
};

const FACTOR_LABELS: Record<string, string> = {
  extreme_rating: "Extreme Rating",
  perfect_score_spam: "Perfect Score Spam",
  rating_outlier: "Rating Outlier",
  repeat_content: "Repeat Content",
  short_generic: "Short Generic",
  excessive_caps: "Excessive Caps",
  excessive_punctuation: "Excessive Punctuation",
  rapid_submission: "Rapid Submission",
  burst_pattern: "Burst Pattern",
  new_account: "New Account",
  single_review_user: "Single Review User",
  low_activity_user: "Low Activity User",
};

export default function ReviewModerationPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [adminNote, setAdminNote] = useState("");

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    await bulkApproveReviews(formData);
    setSelectedIds([]);
  };

  const handleBulkHide = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    formData.append("adminNote", adminNote);
    await bulkHideReviews(formData);
    setSelectedIds([]);
    setAdminNote("");
  };

  const handleBulkFlag = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    formData.append("adminNote", adminNote);
    await bulkFlagReviews(formData);
    setSelectedIds([]);
    setAdminNote("");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const formData = new FormData();
    selectedIds.forEach((id) => formData.append("ratingIds", id.toString()));
    formData.append("adminNote", adminNote);
    await bulkDeleteReviews(formData);
    setSelectedIds([]);
    setAdminNote("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          AI-powered suspicious review detection and moderation queue
        </p>
      </div>

      <Suspense fallback={<AdminTableSkeleton cols={4} rows={4} />}>
        <ModerationContent
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          onBulkApprove={handleBulkApprove}
          onBulkHide={handleBulkHide}
          onBulkFlag={handleBulkFlag}
          onBulkDelete={handleBulkDelete}
        />
      </Suspense>
    </div>
  );
}

async function ModerationContent({
  selectedIds,
  setSelectedIds,
  adminNote,
  setAdminNote,
  onBulkApprove,
  onBulkHide,
  onBulkFlag,
  onBulkDelete,
}: {
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  adminNote: string;
  setAdminNote: (note: string) => void;
  onBulkApprove: () => void;
  onBulkHide: () => void;
  onBulkFlag: () => void;
  onBulkDelete: () => void;
}) {
  const { getModerationQueue, getModerationStats } =
    await import("@/lib/actions/admin/review-moderation");
  const [queue, stats] = await Promise.all([
    getModerationQueue(20),
    getModerationStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.pendingModeration}
              </p>
              <p className="text-muted-foreground text-xs">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.suspiciousReviews}
              </p>
              <p className="text-muted-foreground text-xs">Suspicious</p>
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
                {stats.resolvedToday}
              </p>
              <p className="text-muted-foreground text-xs">Resolved Today</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.avgResolutionTime}h
              </p>
              <p className="text-muted-foreground text-xs">Avg Resolution</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          onClick={onBulkApprove}
          disabled={selectedIds.length === 0}
        >
          Approve Selected ({selectedIds.length})
        </Button>
        <input
          type="text"
          placeholder="Admin note (optional)"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          className="w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500"
        />
        <Button
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          onClick={onBulkHide}
          disabled={selectedIds.length === 0}
        >
          Hide Selected
        </Button>
        <Button
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          onClick={onBulkFlag}
          disabled={selectedIds.length === 0}
        >
          Flag Selected
        </Button>
        <Button
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          onClick={onBulkDelete}
          disabled={selectedIds.length === 0}
        >
          Delete Selected
        </Button>
      </div>

      {/* Moderation Queue */}
      <Card className="border-white/8 bg-white/3">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Moderation Queue
          </h2>

          {queue.length === 0 ? (
            <div className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-4 text-gray-400">
                No suspicious reviews detected
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => {
                const SeverityIcon =
                  SEVERITY_ICONS[item.suspiciousFactors.severity];
                return (
                  <div
                    key={item.reviewId}
                    className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <Checkbox
                      checked={selectedIds.includes(item.reviewId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, item.reviewId]);
                        } else {
                          setSelectedIds(
                            selectedIds.filter((id) => id !== item.reviewId),
                          );
                        }
                      }}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge
                              className={
                                SEVERITY_COLORS[item.suspiciousFactors.severity]
                              }
                            >
                              <SeverityIcon className="mr-1 h-3 w-3" />
                              {item.suspiciousFactors.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              Score: {item.suspiciousFactors.score}
                            </span>
                            <span className="text-sm text-gray-400">
                              Priority: {item.priority}
                            </span>
                          </div>

                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-medium text-white">
                              {item.rating} stars
                            </span>
                            {item.review && (
                              <p className="line-clamp-2 text-sm text-gray-300">
                                {item.review}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {item.suspiciousFactors.factors.map((factor) => (
                              <Badge
                                key={factor}
                                variant="outline"
                                className="border-white/10 bg-white/5 text-xs text-gray-400"
                              >
                                {FACTOR_LABELS[factor] || factor}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="ml-4 text-right">
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-xs"
                            asChild
                          >
                            <a href={`/admin/reviews/${item.reviewId}`}>
                              View Details
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
