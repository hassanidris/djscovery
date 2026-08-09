import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface DjGigReview {
  id: number;
  rating: number;
  review: string | null;
  createdAt: Date | string;
  djProfile: {
    id: number;
    stageName: string;
    slug: string;
    avatar: string | null;
  };
  gig?: {
    id: number;
    title: string;
    slug: string;
  };
}

interface DjGigReviewDisplayProps {
  reviews: DjGigReview[];
  showTitle?: boolean;
  showGig?: boolean;
}

export function DjGigReviewDisplay({
  reviews,
  showTitle = true,
  showGig = false,
}: DjGigReviewDisplayProps) {
  if (reviews.length === 0) {
    return (
      <Card className="border-white/8 bg-white/3">
        <CardContent className="py-5">
          <p className="text-sm text-gray-400">No DJ reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <h3 className="text-lg font-semibold text-white">DJ Reviews</h3>
      )}
      {reviews.map((review) => (
        <Card key={review.id} className="border-white/8 bg-white/3">
          <CardContent className="py-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {review.djProfile.avatar ? (
                  <div
                    className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${review.djProfile.avatar})`,
                    }}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
                    <span className="text-sm font-medium text-gray-300">
                      {review.djProfile.stageName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    href={`/djs/${review.djProfile.slug}`}
                    className="text-sm font-medium text-white hover:text-gray-300"
                  >
                    {review.djProfile.stageName}
                  </Link>
                  {showGig && review.gig && (
                    <Link
                      href={`/gigs/${review.gig.slug}`}
                      className="block text-xs text-gray-400 hover:text-gray-300"
                    >
                      {review.gig.title}
                    </Link>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.review && (
              <p className="text-sm text-gray-300">{review.review}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
