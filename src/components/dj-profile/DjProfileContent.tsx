import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faImage,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

// ── Types ──────────────────────────────────────────────────────────────────────

type MediaItem = { id: number; url: string };

type RatingItem = {
  id: number;
  rating: number;
  review: string | null;
  createdAt: string;
  user: { username: string; name: string | null; image: string | null };
};

type DjTypeValue = "CLUB" | "WEDDING" | "FESTIVAL" | "CORPORATE" | "BAR_LOUNGE";

type Props = {
  bio: string | null;
  djTypes: DjTypeValue[];
  media: MediaItem[];
  ratings: RatingItem[];
  avgRating: number;
  ratingCount: number;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const DJ_TYPE_LABELS: Record<DjTypeValue, string> = {
  CLUB: "Club",
  WEDDING: "Wedding",
  FESTIVAL: "Festival",
  CORPORATE: "Corporate",
  BAR_LOUNGE: "Bar / Lounge",
};

const DEMO_MEDIA: MediaItem[] = [
  { id: -1, url: "/gallery-1.png" },
  { id: -2, url: "/gallery-2.png" },
  { id: -3, url: "/gallery-3.png" },
  { id: -4, url: "/gallery-4.png" },
  { id: -5, url: "/rated-9.webp" },
  { id: -6, url: "/rated-10.webp" },
];

const DEMO_RATINGS: RatingItem[] = [
  {
    id: -1,
    rating: 5,
    review:
      "Absolutely electric set. The crowd energy was insane from first to last track. One of the best nights I've been to.",
    createdAt: "2025-06-12T00:00:00.000Z",
    user: { username: "clubber_alex", name: "Alex K.", image: "/rated-1.webp" },
  },
  {
    id: -2,
    rating: 4,
    review:
      "Incredible mixing skills. The transitions were seamless and the track selection was perfect for the vibe.",
    createdAt: "2025-05-28T00:00:00.000Z",
    user: { username: "music_lover", name: "Sarah M.", image: "/rated-2.webp" },
  },
  {
    id: -3,
    rating: 5,
    review:
      "Been following this DJ for years. Always delivers. Worth every penny for a booking.",
    createdAt: "2025-04-10T00:00:00.000Z",
    user: {
      username: "nightowl_beats",
      name: "Jay T.",
      image: "/rated-3.webp",
    },
  },
];

// ── Helper ─────────────────────────────────────────────────────────────────────

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={cn(
            size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5",
            i <= Math.round(rating) ? "text-amber-400" : "text-gray-700",
          )}
        />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfileContent({
  bio,
  djTypes,
  media,
  ratings,
  avgRating,
  ratingCount,
}: Props) {
  const isMediaDemo = media.length === 0;
  const isRatingsDemo = ratingCount === 0;

  const displayMedia = isMediaDemo ? DEMO_MEDIA : media;
  const displayRatings = isRatingsDemo ? DEMO_RATINGS : ratings;
  const displayAvgRating = isRatingsDemo ? 4.8 : avgRating;
  const displayRatingCount = isRatingsDemo ? 42 : ratingCount;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: displayRatings.filter((r) => r.rating === star).length,
    percentage:
      displayRatings.length > 0
        ? Math.round(
            (displayRatings.filter((r) => r.rating === star).length /
              displayRatings.length) *
              100,
          )
        : 0,
  }));

  return (
    <div className="flex flex-col gap-10">
      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-heading text-xl text-white mb-4">About</h2>

        {bio ? (
          <p className="text-gray-300 text-sm leading-relaxed mb-5">{bio}</p>
        ) : (
          <p className="text-gray-500 text-sm italic mb-5">
            No bio has been added yet.
          </p>
        )}

        {djTypes.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-4">
            <span className="text-xs text-gray-500 shrink-0">
              Specializes in:
            </span>
            {djTypes.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="border-white/15 text-gray-300"
              >
                {DJ_TYPE_LABELS[t]}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <Separator className="bg-white/8" />

      {/* ── GALLERY ───────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-white">Gallery</h2>
          {isMediaDemo && (
            <span className="text-xs text-gray-600 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
              Demo content
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {displayMedia.map((m) => (
            <div
              key={m.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-h_blackLight/50 ring-1 ring-white/5 hover:ring-h_red/40 transition-all cursor-pointer group"
            >
              <Image
                src={m.url}
                alt="DJ media"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
          <button
            disabled
            className="relative aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-gray-700 cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faImage} className="h-5 w-5" />
            <span className="text-xs">Add Media</span>
          </button>
        </div>
      </section>

      <Separator className="bg-white/8" />

      {/* ── REVIEWS ───────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl text-white">Reviews</h2>
            {isRatingsDemo && (
              <span className="text-xs text-gray-600 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
                Demo content
              </span>
            )}
          </div>
          <Button
            disabled
            variant="outline"
            size="sm"
            className="border-h_red/40 text-h_red hover:bg-h_red/10 disabled:opacity-40"
          >
            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5 mr-1.5" />
            Write a Review
          </Button>
        </div>

        {/* Rating Overview */}
        <div className="flex flex-col sm:flex-row gap-6 mb-7 p-5 rounded-xl bg-h_blackLight/30 border border-white/5">
          <div className="flex flex-col items-center justify-center shrink-0 min-w-28 gap-1.5">
            <span className="text-5xl font-bold text-white leading-none">
              {displayAvgRating.toFixed(1)}
            </span>
            <Stars rating={displayAvgRating} size="lg" />
            <span className="text-xs text-gray-500 mt-1">
              {displayRatingCount} reviews
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-3 text-right">
                  {star}
                </span>
                <FontAwesomeIcon
                  icon={faStar}
                  className="h-3 w-3 text-amber-400 shrink-0"
                />
                <Progress
                  value={percentage}
                  className="flex-1 h-1.5 bg-white/8"
                />
                <span className="text-xs text-gray-600 w-5 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Cards */}
        <div className="flex flex-col gap-4">
          {displayRatings.map((r) => (
            <Card
              key={r.id}
              className="bg-h_blackLight/30 border-white/5 p-5 gap-0"
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-9 ring-1 ring-white/10 shrink-0">
                  <AvatarImage src={r.user.image ?? undefined} />
                  <AvatarFallback className="bg-h_blackLight text-white text-xs">
                    {(r.user.name ?? r.user.username).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {r.user.name ?? r.user.username}
                      </span>
                      <Stars rating={r.rating} />
                    </div>
                    <span className="text-xs text-gray-600">
                      {format(new Date(r.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  {r.review && (
                    <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                      {r.review}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
