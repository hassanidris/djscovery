"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

type ReputationDetail = {
  totalScore: number;
  profileQualityScore: number;
  verificationScore: number;
  reviewScore: number;
  reliabilityScore: number;
  activityScore: number;
  newTalentBoost: number;
} | null;

const MAXS = {
  profileQuality: 150,
  verification: 50,
  review: 550,
  reliability: 150,
  activity: 100,
};

const LABELS: Record<keyof typeof MAXS, string> = {
  profileQuality: "Profile Quality",
  verification: "Verification",
  review: "Reviews",
  reliability: "Reliability",
  activity: "Activity",
};

export function ScoreBreakdown({
  reputationDetail,
}: {
  reputationDetail: ReputationDetail;
}) {
  if (!reputationDetail) return null;

  const rows = [
    {
      label: LABELS.profileQuality,
      score: reputationDetail.profileQualityScore,
      max: MAXS.profileQuality,
    },
    {
      label: LABELS.verification,
      score: reputationDetail.verificationScore,
      max: MAXS.verification,
    },
    {
      label: LABELS.review,
      score: reputationDetail.reviewScore,
      max: MAXS.review,
    },
    {
      label: LABELS.reliability,
      score: reputationDetail.reliabilityScore,
      max: MAXS.reliability,
    },
    {
      label: LABELS.activity,
      score: reputationDetail.activityScore,
      max: MAXS.activity,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-white/10 bg-white/5 px-2.5 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <Trophy className="mr-1.5 h-3 w-3 text-amber-400" />
          Score breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#111] text-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Score breakdown</DialogTitle>
          <DialogDescription className="text-gray-400">
            How your reputation score is calculated.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg bg-white/5 p-3 text-sm">
          {rows.map(({ label, score, max }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-400">{label}</span>
              <span className="font-medium text-white">
                {score}/{max}
              </span>
            </div>
          ))}
          {reputationDetail.newTalentBoost > 0 && (
            <div className="flex items-center justify-between border-t border-white/10 pt-2">
              <span className="text-emerald-400">New Talent Boost</span>
              <span className="font-medium text-emerald-400">
                +{reputationDetail.newTalentBoost}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="font-semibold text-white">Total</span>
            <span className="font-semibold text-white">
              {reputationDetail.totalScore}/1000
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
