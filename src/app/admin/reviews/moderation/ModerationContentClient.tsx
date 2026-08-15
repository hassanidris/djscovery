"use client";

import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import BulkActions from "./BulkActions";
import ModerationQueue from "./ModerationQueue";
import { useState } from "react";

interface ModerationContentClientProps {
  queue: any[];
  stats: any;
}

export default function ModerationContentClient({
  queue,
  stats,
}: ModerationContentClientProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [adminNote, setAdminNote] = useState("");

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
      <BulkActions
        reviewIds={queue.map((item) => item.reviewId)}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        adminNote={adminNote}
        onAdminNoteChange={setAdminNote}
      />

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
            <ModerationQueue
              queue={queue}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
