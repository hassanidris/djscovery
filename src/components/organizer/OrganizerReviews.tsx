import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { ReportButton } from "@/components/reporting/ReportButton";

type ReviewItem = {
  id: number;
  communication: number;
  payment: number;
  professionalism: number;
  venueQuality: number;
  rating: number;
  review: string | null;
  createdAt: Date;
  djProfile: {
    slug: string;
    stageName: string;
    avatar: string | null;
    status: string;
    city: { name: string } | null;
    country: { name: string } | null;
  };
};

interface Props {
  avgRating: number;
  ratingCount: number;
  reviews: ReviewItem[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-gray-400"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function OrganizerReviews({
  avgRating,
  ratingCount,
  reviews,
}: Props) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-white">Organizer Reviews</h2>

      <div className="bg-h_blackLight/30 mb-7 flex flex-col gap-6 rounded-xl border border-white/5 p-5 sm:flex-row">
        <div className="flex min-w-24 shrink-0 flex-col items-center justify-center gap-1.5">
          <span className="text-5xl leading-none font-bold text-white">
            {avgRating.toFixed(1)}
          </span>
          <StarRating rating={avgRating} />
          <span className="text-xs text-gray-400">{ratingCount} reviews</span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter((r) => r.rating === s).length;
            const pct =
              reviews.length > 0
                ? Math.round((count / reviews.length) * 100)
                : 0;
            return (
              <div key={s} className="flex items-center gap-3">
                <span className="w-3 text-right text-xs text-gray-400">
                  {s}
                </span>
                <Star className="h-3 w-3 shrink-0 text-amber-400" />
                <Progress value={pct} className="h-1.5 flex-1 bg-white/8" />
                <span className="w-8 text-right text-xs text-gray-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <Card
            key={r.id}
            className="bg-h_blackLight/30 gap-0 border-white/5 p-5"
          >
            <div className="flex items-start gap-3">
              <Avatar className="size-9 shrink-0 ring-1 ring-white/10">
                <AvatarImage src={r.djProfile.avatar || undefined} />
                <AvatarFallback className="bg-h_blackLight text-xs text-white">
                  {r.djProfile.stageName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {r.djProfile.stageName}
                    </span>
                    <StarRating rating={r.rating} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(r.createdAt)}
                    </span>
                    <ReportButton
                      targetType="REVIEW"
                      targetId={String(r.id)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-white"
                    />
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Communication:</span>
                    <span className="text-gray-300">{r.communication}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Payment:</span>
                    <span className="text-gray-300">{r.payment}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Professionalism:</span>
                    <span className="text-gray-300">{r.professionalism}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Venue:</span>
                    <span className="text-gray-300">{r.venueQuality}/5</span>
                  </div>
                </div>

                {r.review && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">
                    {r.review}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
