import Image from "next/image";
import Link from "next/link";
import { Star, CircleCheck } from "lucide-react";
import { getMyReviews } from "@/lib/actions/saves";

export const metadata = { title: "My Reviews" };

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-gray-600"
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

export default async function ReviewsPage() {
  const reviews = await getMyReviews();

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <Star className="h-6 w-6 text-gray-500" />
        </div>
        <p className="text-sm font-medium text-white">No reviews yet</p>
        <p className="mt-1 text-sm text-gray-500">
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
      <p className="mb-1 text-sm text-gray-500">
        {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
      </p>
      {reviews.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-white/6 bg-white/3 px-4 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/djs/${r.djProfile.slug}`}
              className="flex items-center gap-3"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/8">
                {r.djProfile.avatar ? (
                  <Image
                    src={r.djProfile.avatar}
                    alt={r.djProfile.stageName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">
                    {r.djProfile.stageName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white">
                    {r.djProfile.stageName}
                  </span>
                  {r.djProfile.verified && (
                    <CircleCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  )}
                </div>
                {(r.djProfile.city || r.djProfile.country) && (
                  <p className="text-xs text-gray-500">
                    {[r.djProfile.city?.name, r.djProfile.country?.name]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </Link>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <StarRating rating={r.rating} />
              <span className="text-xs text-gray-600">
                {formatDate(r.updatedAt)}
              </span>
            </div>
          </div>

          {r.review && (
            <p className="mt-3 border-t border-white/6 pt-3 text-sm leading-relaxed text-gray-300">
              {r.review}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
