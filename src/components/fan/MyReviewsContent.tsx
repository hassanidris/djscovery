import Link from "next/link";
import { Star } from "lucide-react";
import { getMyReviews } from "@/lib/actions/follows";
import ReviewListItem from "./ReviewListItem";

export default async function MyReviewsContent() {
  const reviews = await getMyReviews();

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <Star className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-white">No reviews yet</p>
        <p className="mt-1 text-sm text-gray-400">
          Visit a{" "}
          <Link
            href="/directory"
            className="text-white underline underline-offset-2"
          >
            DJ profile
          </Link>{" "}
          to leave your first review.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="mb-1 text-sm text-gray-400">
        {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
      </p>
      {reviews.map((r) => (
        <ReviewListItem key={r.id} review={r} />
      ))}
    </div>
  );
}
