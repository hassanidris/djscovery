import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import {
  Stars,
  SectionHeading,
  type ReviewItem,
} from "@/components/dj-profile/dj-profile-shared";

type Props = {
  avgRating: number;
  ratingCount: number;
  reviews: ReviewItem[];
};

export default function ProfileReviews({
  avgRating,
  ratingCount,
  reviews,
}: Props) {
  return (
    <section>
      <SectionHeading sub={`${ratingCount} verified reviews`}>
        Crowd Feedback
      </SectionHeading>
      <div className="flex flex-col sm:flex-row gap-6 mb-7 p-5 rounded-xl bg-h_blackLight/30 border border-white/5">
        <div className="flex flex-col items-center justify-center shrink-0 min-w-24 gap-1.5">
          <span className="text-5xl font-bold text-white leading-none">
            {avgRating.toFixed(1)}
          </span>
          <Stars rating={avgRating} size="lg" />
          <span className="text-xs text-gray-500">{ratingCount} reviews</span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter((r) => r.rating === s).length;
            const pct =
              reviews.length > 0
                ? Math.round((count / reviews.length) * 100)
                : 0;
            return (
              <div key={s} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-3 text-right">{s}</span>
                <Star className="h-3 w-3 text-amber-400 shrink-0" />
                <Progress value={pct} className="flex-1 h-1.5 bg-white/8" />
                <span className="text-xs text-gray-600 w-8 text-right">
                  {Math.round((ratingCount * pct) / 100)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <Card key={r.id} className="bg-h_blackLight/30 border-white/5 p-5 gap-0">
            <div className="flex items-start gap-3">
              <Avatar className="size-9 ring-1 ring-white/10 shrink-0">
                <AvatarImage src={r.user.image} />
                <AvatarFallback className="bg-h_blackLight text-white text-xs">
                  {r.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                      {r.user.name}
                    </span>
                    <Stars rating={r.rating} />
                  </div>
                  <span className="text-xs text-gray-600">{r.date}</span>
                </div>
                <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                  {r.review}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
