"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCalendarDays,
  faMapPin,
  faImage,
  faLock,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

// ── Types ──────────────────────────────────────────────────────────────────────

type MediaItem = { id: number; url: string };

type EventItem = {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  image: string | null;
};

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
  city: string | null;
  country: string | null;
  media: MediaItem[];
  events: EventItem[];
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

const DEMO_EVENTS: EventItem[] = [
  {
    id: -1,
    title: "Berlin Underground — Summer Closing",
    startDate: "2025-09-20T22:00:00.000Z",
    endDate: "2025-09-21T06:00:00.000Z",
    venue: "Berghain",
    city: "Berlin",
    country: "Germany",
    image: null,
  },
  {
    id: -2,
    title: "Sunburn Festival — Stage B",
    startDate: "2025-10-15T18:00:00.000Z",
    endDate: null,
    venue: "Candolim Beach",
    city: "Goa",
    country: "India",
    image: null,
  },
  {
    id: -3,
    title: "Warehouse Sessions Vol. 4",
    startDate: "2025-11-08T23:00:00.000Z",
    endDate: null,
    venue: "Fabric London",
    city: "London",
    country: "UK",
    image: null,
  },
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
    user: {
      username: "music_lover",
      name: "Sarah M.",
      image: "/rated-2.webp",
    },
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

// ── Helper Components ──────────────────────────────────────────────────────────

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

export default function DjProfileTabs({
  bio,
  djTypes,
  city,
  country,
  media,
  events,
  ratings,
  avgRating,
  ratingCount,
}: Props) {
  const isMediaDemo = media.length === 0;
  const isEventsDemo = events.length === 0;
  const isRatingsDemo = ratingCount === 0;

  const displayMedia = isMediaDemo ? DEMO_MEDIA : media;
  const displayEvents = isEventsDemo ? DEMO_EVENTS : events;
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

  const location = [city, country].filter(Boolean).join(", ");

  return (
    <Tabs defaultValue="about" className="w-full">
      {/* Tab Bar */}
      <TabsList
        variant="line"
        className="w-full justify-start h-auto rounded-none bg-transparent border-b border-white/10 pb-0 gap-0"
      >
        <TabsTrigger
          value="about"
          className="px-5 py-3 rounded-none text-sm font-medium after:bg-h_red!"
        >
          About
        </TabsTrigger>
        <TabsTrigger
          value="media"
          className="px-5 py-3 rounded-none text-sm font-medium after:bg-h_red!"
        >
          Media
        </TabsTrigger>
        <TabsTrigger
          value="events"
          className="px-5 py-3 rounded-none text-sm font-medium after:bg-h_red!"
        >
          Events
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="px-5 py-3 rounded-none text-sm font-medium after:bg-h_red!"
        >
          Reviews
        </TabsTrigger>
        <TabsTrigger
          value="posts"
          disabled
          className="px-5 py-3 rounded-none text-sm font-medium gap-1.5"
        >
          Posts
          <FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5" />
        </TabsTrigger>
      </TabsList>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <TabsContent value="about" className="pt-8">
        <div className="grid gap-6">
          <div>
            <h2 className="font-heading text-xl text-white mb-3">About</h2>
            {bio ? (
              <p className="text-gray-300 text-sm leading-relaxed">{bio}</p>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No bio has been added yet.
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {djTypes.length > 0 && (
              <Card className="bg-h_blackLight/30 border-white/5 p-5 gap-0">
                <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="h-3.5 w-3.5 text-h_red"
                  />
                  Specializes In
                </h3>
                <div className="flex flex-wrap gap-2">
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
              </Card>
            )}

            {location && (
              <Card className="bg-h_blackLight/30 border-white/5 p-5 gap-0">
                <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="h-3.5 w-3.5 text-h_red"
                  />
                  Based In
                </h3>
                <p className="text-gray-300 text-sm">{location}</p>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* ── MEDIA ─────────────────────────────────────────────────────────── */}
      <TabsContent value="media" className="pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-white">Media</h2>
          {isMediaDemo && (
            <span className="text-xs text-gray-600 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
              Demo content
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
          {/* Disabled upload slot */}
          <button
            disabled
            className="relative aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-gray-700 cursor-not-allowed hover:border-white/15 transition-colors"
          >
            <FontAwesomeIcon icon={faImage} className="h-6 w-6" />
            <span className="text-xs">Add Media</span>
          </button>
        </div>
      </TabsContent>

      {/* ── EVENTS ────────────────────────────────────────────────────────── */}
      <TabsContent value="events" className="pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-white">Upcoming Events</h2>
          {isEventsDemo && (
            <span className="text-xs text-gray-600 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
              Demo content
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {displayEvents.map((e) => (
            <Card
              key={e.id}
              className="bg-h_blackLight/30 border-white/5 p-4 hover:border-white/10 transition-colors cursor-pointer gap-0"
            >
              <div className="flex items-center gap-4">
                {/* Date Badge */}
                <div className="shrink-0 w-12 h-12 rounded-lg bg-h_red/10 border border-h_red/20 flex flex-col items-center justify-center text-center">
                  <span className="text-h_red text-[10px] font-bold leading-none uppercase">
                    {format(new Date(e.startDate), "MMM")}
                  </span>
                  <span className="text-white text-lg font-bold leading-none mt-0.5">
                    {format(new Date(e.startDate), "d")}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {e.title}
                  </p>
                  {e.venue && (
                    <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faMapPin}
                        className="h-2.5 w-2.5 text-h_red shrink-0"
                      />
                      {[e.venue, e.city, e.country].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-gray-600 text-xs mt-1">
                    <FontAwesomeIcon
                      icon={faCalendarDays}
                      className="h-2.5 w-2.5 mr-1"
                    />
                    {format(
                      new Date(e.startDate),
                      "EEEE, MMMM d, yyyy · h:mm a",
                    )}
                  </p>
                </div>

                <Badge className="shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/15 text-xs h-5">
                  Upcoming
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* ── REVIEWS ───────────────────────────────────────────────────────── */}
      <TabsContent value="reviews" className="pt-8">
        {/* Rating Overview */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8 p-6 rounded-xl bg-h_blackLight/30 border border-white/5">
          {/* Big Rating Number */}
          <div className="flex flex-col items-center justify-center shrink-0 min-w-30 gap-2">
            <span className="text-6xl font-bold text-white leading-none">
              {displayAvgRating.toFixed(1)}
            </span>
            <Stars rating={displayAvgRating} size="lg" />
            <span className="text-xs text-gray-500 mt-1">
              {displayRatingCount} reviews
            </span>
            {isRatingsDemo && (
              <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/8">
                Demo
              </span>
            )}
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 flex flex-col justify-center gap-2.5">
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

        {/* Reviews Header + CTA */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-white">Reviews</h2>
          <Button
            disabled
            variant="outline"
            size="sm"
            className="border-h_red/40 text-h_red hover:bg-h_red/10 hover:border-h_red disabled:opacity-40"
          >
            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5 mr-1.5" />
            Write a Review
          </Button>
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
      </TabsContent>
    </Tabs>
  );
}
