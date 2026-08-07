import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface VenueReview {
  id: number;
  soundSystem: number;
  atmosphere: number;
  location: number;
  accessibility: number;
  rating: number;
  review: string | null;
  createdAt: Date;
  user: {
    username: string | null;
    image: string | null;
  };
  event?: {
    id: number;
    slug: string;
    title: string;
  };
}

interface VenueReviewsProps {
  avgRating: number;
  ratingCount: number;
  reviews: VenueReview[];
  categoryAverages?: {
    soundSystem: number;
    atmosphere: number;
    location: number;
    accessibility: number;
  };
}

export function VenueReviews({
  avgRating,
  ratingCount,
  reviews,
  categoryAverages,
}: VenueReviewsProps) {
  if (reviews.length === 0) return null;

  const categoryAvg = categoryAverages || {
    soundSystem:
      reviews.reduce((sum, r) => sum + r.soundSystem, 0) / reviews.length,
    atmosphere:
      reviews.reduce((sum, r) => sum + r.atmosphere, 0) / reviews.length,
    location: reviews.reduce((sum, r) => sum + r.location, 0) / reviews.length,
    accessibility:
      reviews.reduce((sum, r) => sum + r.accessibility, 0) / reviews.length,
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <Card className="border-white/8 bg-white/3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white">
            Venue Reviews
          </CardTitle>
          <Badge variant="secondary" className="bg-white/10 text-gray-300">
            {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-600"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-white">
            {avgRating.toFixed(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-gray-400">{star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-400">{count}</span>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/5 bg-white/2 p-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Sound System</p>
            <p className="text-sm font-medium text-white">
              {categoryAvg.soundSystem.toFixed(1)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Atmosphere</p>
            <p className="text-sm font-medium text-white">
              {categoryAvg.atmosphere.toFixed(1)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Location</p>
            <p className="text-sm font-medium text-white">
              {categoryAvg.location.toFixed(1)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Accessibility</p>
            <p className="text-sm font-medium text-white">
              {categoryAvg.accessibility.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.slice(0, 5).map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-white/5 bg-white/2 p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="size-8 shrink-0 ring-1 ring-white/10">
                    <AvatarImage src={review.user.image || undefined} />
                    <AvatarFallback className="bg-h_blackLight text-xs text-white">
                      {review.user.username?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {review.user.username || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {review.event && (
                        <>
                          {" · "}
                          <span className="text-gray-400">
                            at {review.event.title}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.review && (
                <p className="text-sm leading-relaxed text-gray-400">
                  {review.review}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
