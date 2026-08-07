import Image from "next/image";
import Link from "next/link";
import { Star, CircleCheck } from "lucide-react";

type Review = {
  id: number;
  rating: number;
  review: string | null;
  updatedAt: Date;
  djProfile: {
    slug: string;
    stageName: string;
    avatar: string | null;
    status: string;
    city: { name: string } | null;
    country: { name: string } | null;
  };
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
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

export default function ReviewListItem({ review: r }: { review: Review }) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/3 px-4 py-4">
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
              {r.djProfile.status === "APPROVED" && (
                <CircleCheck
                  className="h-3.5 w-3.5 shrink-0 text-blue-400"
                  aria-label="Admin approved"
                />
              )}
            </div>
            {(r.djProfile.city || r.djProfile.country) && (
              <p className="text-xs text-gray-400">
                {[r.djProfile.city?.name, r.djProfile.country?.name]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <StarRating rating={r.rating} />
          <span className="text-xs text-gray-400">
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
  );
}
