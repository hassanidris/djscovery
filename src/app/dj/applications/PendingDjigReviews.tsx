"use client";

import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface PendingDjGigReview {
  id: number;
  slug: string;
  title: string;
  organizerDisplayName: string;
  completedAt: Date;
}

interface PendingDjGigReviewsProps {
  pendingReviews: PendingDjGigReview[];
}

export default function PendingDjGigReviews({
  pendingReviews,
}: PendingDjGigReviewsProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getDaysRemaining = (completedAt: Date) => {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const completedDate = new Date(completedAt);
    const deadline = new Date(completedDate.getTime() + thirtyDaysMs);
    const remaining = Math.max(
      0,
      Math.ceil((deadline.getTime() - currentTime) / (1000 * 60 * 60 * 24)),
    );
    return remaining;
  };

  if (pendingReviews.length === 0) return null;

  return (
    <section>
      <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        Pending Reviews
      </h2>
      <div className="flex flex-col gap-3">
        {pendingReviews.map((gig) => {
          const daysRemaining = getDaysRemaining(gig.completedAt);
          return (
            <Card key={gig.id} className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <Star className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {gig.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      Review {gig.organizerDisplayName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    {daysRemaining} days left to review
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-500 text-white hover:bg-amber-600"
                    asChild
                  >
                    <Link href={`/gigs/${gig.slug}/dj-review`}>
                      <Star className="mr-1.5 h-3.5 w-3.5" />
                      Leave Review
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
