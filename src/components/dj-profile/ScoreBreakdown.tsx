"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    { label: LABELS.profileQuality, score: reputationDetail.profileQualityScore, max: MAXS.profileQuality },
    { label: LABELS.verification, score: reputationDetail.verificationScore, max: MAXS.verification },
    { label: LABELS.review, score: reputationDetail.reviewScore, max: MAXS.review },
    { label: LABELS.reliability, score: reputationDetail.reliabilityScore, max: MAXS.reliability },
    { label: LABELS.activity, score: reputationDetail.activityScore, max: MAXS.activity },
  ];

  return (
    <div className="w-full max-w-sm">
      <Accordion type="single" collapsible defaultValue="breakdown">
        <AccordionItem value="breakdown" className="border-none">
          <AccordionTrigger className="text-xs text-gray-300 hover:text-white">
            Score breakdown
          </AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
