"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapPin,
  faStar,
  faUsers,
  faCalendarDays,
  faUserPlus,
  faShareNodes,
  faLock,
  faPlay,
  faMusic,
  faVideo,
  faImage,
  faCheckCircle,
  faChartLine,
  faBolt,
  faCrown,
  faEnvelope,
  faPhone,
  faGlobe,
  faLocationDot,
  faTrophy,
  faFireFlameCurved,
  faHeadphones,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faTiktok,
  faYoutube,
  faSoundcloud,
  faSpotify,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { format } from "date-fns";

// ── Demo Data ──────────────────────────────────────────────────────────────────

const DJ = {
  stageName: "Amara Pulse",
  avatar: "/rated-6.webp",
  coverImage: "/noCover-1.jpg",
  bio: "Bringing the pulse of Lagos to the world stage. Amara blends Afrobeats and Amapiano into euphoric, floor-filling sets that transcend borders. With residencies across London, Paris, and Dubai, she's one of the fastest-rising names in global club culture.",
  city: "Lagos",
  country: "Nigeria",
  genres: ["Afrobeats", "Amapiano", "House"],
  socialLinks: [
    { platform: "instagram", url: "#" },
    { platform: "soundcloud", url: "#" },
    { platform: "tiktok", url: "#" },
    { platform: "spotify", url: "#" },
  ],
  avgRating: 4.8,
  ratingCount: 42,
  followerCount: 5200,
  eventsCount: 12,
  bookingEmail: "bookings@amarapulse.com",
  bookingPhone: "+44 7700 900123",
  website: "www.amarapulse.com",
  minFee: "£1,500",
  maxFee: "£8,000",
  djTypes: ["Festival", "Club", "Corporate"],
};

const EVENTS = [
  {
    id: 1,
    title: "Berlin Underground — Summer Closing",
    date: "2025-09-20T22:00:00Z",
    venue: "Berghain",
    city: "Berlin",
    country: "Germany",
  },
  {
    id: 2,
    title: "Sunburn Festival — Stage B",
    date: "2025-10-15T18:00:00Z",
    venue: "Candolim Beach",
    city: "Goa",
    country: "India",
  },
  {
    id: 3,
    title: "Warehouse Sessions Vol. 4",
    date: "2025-11-08T23:00:00Z",
    venue: "Fabric London",
    city: "London",
    country: "UK",
  },
];

const VENUES = [
  { name: "Berghain", city: "Berlin", country: "DE", count: 4 },
  { name: "Fabric London", city: "London", country: "UK", count: 6 },
  { name: "DC-10", city: "Ibiza", country: "ES", count: 3 },
  { name: "Club Space", city: "Miami", country: "US", count: 2 },
  { name: "Printworks", city: "London", country: "UK", count: 5 },
];

const REVIEWS = [
  {
    id: 1,
    rating: 5,
    review:
      "Absolutely electric set. The crowd energy was insane from first to last track. One of the best nights I've been to.",
    date: "2025-06-12",
    user: { name: "Alex K.", image: "/rated-1.webp" },
  },
  {
    id: 2,
    rating: 4,
    review:
      "Incredible mixing skills. The transitions were seamless and the track selection was perfect for the vibe.",
    date: "2025-05-28",
    user: { name: "Sarah M.", image: "/rated-2.webp" },
  },
  {
    id: 3,
    rating: 5,
    review:
      "Been following this DJ for years. Always delivers. Worth every penny for a booking.",
    date: "2025-04-10",
    user: { name: "Jay T.", image: "/rated-3.webp" },
  },
];

const MEDIA = [
  { id: 1, url: "/gallery-1.png" },
  { id: 2, url: "/gallery-2.png" },
  { id: 3, url: "/gallery-3.png" },
  { id: 4, url: "/gallery-4.png" },
  { id: 5, url: "/rated-9.webp" },
  { id: 6, url: "/rated-10.webp" },
];

const SOCIAL_ICONS: Record<string, IconDefinition> = {
  instagram: faInstagram,
  tiktok: faTiktok,
  youtube: faYoutube,
  soundcloud: faSoundcloud,
  spotify: faSpotify,
};

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
            size === "lg" ? "h-4 w-4" : "h-3 w-3",
            i <= Math.round(rating) ? "text-amber-400" : "text-gray-700",
          )}
        />
      ))}
    </div>
  );
}

function LockedCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: IconDefinition;
}) {
  return (
    <div className="relative rounded-xl border border-white/8 bg-white/2 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      <div className="relative p-5 flex flex-col items-center text-center gap-3">
        <div className="size-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{title}</p>
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        </div>
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
          <FontAwesomeIcon icon={faCrown} className="h-2.5 w-2.5 mr-1" />
          Premium Feature
        </Badge>
      </div>
    </div>
  );
}

function SectionHeading({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="font-heading text-xl text-white">{children}</h2>
        {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfileFree() {
  const [bioExpanded, setBioExpanded] = useState(false);
  const location = `${DJ.city}, ${DJ.country}`;

  return (
    <div className="min-h-screen bg-black">
      {/* ── HERO ── */}
      <section className="w-full">
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <Image
            src={DJ.coverImage}
            alt="cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-h_red/8 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-14 pb-5">
            <div className="relative shrink-0 z-10">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-h_red ring-offset-2 ring-offset-black">
                <Image
                  src={DJ.avatar}
                  alt={DJ.stageName}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-1 sm:pb-2">
              <h1 className="font-heading text-3xl md:text-4xl text-white leading-none">
                {DJ.stageName}
              </h1>
              <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faMapPin}
                  className="h-3 w-3 text-h_red"
                />{" "}
                {location}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:pb-2">
              <Button className="bg-h_red hover:bg-h_redDark text-white font-semibold">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="h-3.5 w-3.5 mr-1.5"
                />
                Book DJ
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/5"
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="h-3.5 w-3.5 mr-1.5"
                />
                Follow
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                aria-label="Share"
              >
                <FontAwesomeIcon icon={faShareNodes} className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DJ.genres.map((g) => (
              <Badge
                key={g}
                className="bg-h_redDark/50 text-red-100 border-0 h-6"
              >
                {g}
              </Badge>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-2 mb-6">
            {DJ.socialLinks.map((l) => {
              const icon = SOCIAL_ICONS[l.platform];
              if (!icon) return null;
              return (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/8"
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <Separator className="bg-white/10" />
          <div className="grid grid-cols-3 py-5">
            {[
              {
                val: DJ.followerCount.toLocaleString(),
                label: "Followers",
                icon: faUsers,
              },
              {
                val: DJ.avgRating.toFixed(1),
                label: `${DJ.ratingCount} reviews`,
                icon: faStar,
              },
              {
                val: DJ.eventsCount.toString(),
                label: "Events",
                icon: faCalendarDays,
              },
            ].map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center",
                  i < 2 && "border-r border-white/10",
                )}
              >
                <span className="text-2xl font-bold text-white">{s.val}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <FontAwesomeIcon
                    icon={s.icon}
                    className={cn("h-3 w-3", i === 1 && "text-amber-400")}
                  />
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <Separator className="bg-white/10" />
        </div>
      </section>

      {/* ── PAGE BODY ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            {/* ── SPOTLIGHT ── */}
            <section>
              <SectionHeading sub="Featured content curated by this DJ">
                Spotlight
              </SectionHeading>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Featured Mix */}
                <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-h_red/30 transition-all gap-0">
                  <div className="relative h-40 bg-linear-to-br from-h_red/20 via-purple-900/20 to-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-14 rounded-full bg-h_red/20 border border-h_red/30 flex items-center justify-center group-hover:bg-h_red/30 transition-colors">
                        <FontAwesomeIcon
                          icon={faPlay}
                          className="h-5 w-5 text-white ml-0.5"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-black/60 text-gray-300 border-white/10 text-[10px]">
                        <FontAwesomeIcon
                          icon={faHeadphones}
                          className="h-2.5 w-2.5 mr-1"
                        />
                        Featured Mix
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-white text-sm font-semibold">
                      Afrobeats & Amapiano Fusion Vol.3
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      1h 24m · 38.2k plays
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {["Afrobeats", "Amapiano"].map((t) => (
                        <Badge
                          key={t}
                          className="bg-white/5 text-gray-400 border-white/10 text-[10px] h-4"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Featured Video */}
                <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-h_red/30 transition-all gap-0">
                  <div className="relative h-40 bg-linear-to-br from-slate-900 via-gray-900 to-black">
                    <Image
                      src="/gallery-1.png"
                      alt="video thumbnail"
                      fill
                      className="object-cover opacity-50 group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-14 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                        <FontAwesomeIcon
                          icon={faPlay}
                          className="h-5 w-5 text-white ml-0.5"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-black/60 text-gray-300 border-white/10 text-[10px]">
                        <FontAwesomeIcon
                          icon={faVideo}
                          className="h-2.5 w-2.5 mr-1"
                        />
                        Featured Video
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-white text-sm font-semibold">
                      Live @ Berghain — Summer Closing 2024
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      45 min · YouTube
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-white/5 text-gray-400 border-white/10 text-[10px] h-4">
                        Live Performance
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── ABOUT ── */}
            <section>
              <SectionHeading>About Me</SectionHeading>
              <div>
                <p
                  className={cn(
                    "text-gray-300 text-sm leading-relaxed",
                    !bioExpanded && "line-clamp-4",
                  )}
                >
                  {DJ.bio}
                </p>
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="text-h_red text-xs mt-2 hover:text-red-400 transition-colors"
                >
                  {bioExpanded ? "Show less" : "Read more"}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-4">
                <span className="text-xs text-gray-500 shrink-0">
                  Specializes in:
                </span>
                {DJ.djTypes.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-white/15 text-gray-300 text-xs"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── MY SOUND ── */}
            <section>
              <SectionHeading sub="1 mix · Upgrade to share your full discography">
                My Sound
              </SectionHeading>
              <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-lg bg-linear-to-br from-h_red/30 to-purple-900/30 border border-white/8 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={faMusic}
                      className="h-5 w-5 text-h_red"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">
                      Afrobeats & Amapiano Fusion Vol.3
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      SoundCloud · 1h 24m · 38.2k plays
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-h_red rounded-full" />
                      </div>
                      <span className="text-gray-600 text-[10px]">
                        28:14 / 1:24:00
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-white shrink-0"
                  >
                    <FontAwesomeIcon icon={faPlay} className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
              {/* Locked more mixes */}
              <div className="mt-3 p-3 rounded-lg border border-dashed border-white/10 flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faLock}
                  className="h-3.5 w-3.5 text-amber-500 shrink-0"
                />
                <p className="text-gray-500 text-xs">
                  <span className="text-amber-400 font-medium">
                    8 more mixes hidden.
                  </span>{" "}
                  Upgrade to Premium to unlock your full discography.
                </p>
                <Badge className="ml-auto shrink-0 bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs cursor-pointer hover:bg-amber-500/20 transition-colors">
                  Upgrade
                </Badge>
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── MEDIA ── */}
            <section>
              <SectionHeading sub="Unlimited photos · 1 video on Free plan">
                Media
              </SectionHeading>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {MEDIA.map((m) => (
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
              </div>
              {/* Locked video */}
              <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden gap-0">
                <div className="relative h-44 bg-linear-to-br from-slate-900 to-black">
                  <Image
                    src="/gallery-2.png"
                    alt="video"
                    fill
                    className="object-cover opacity-30"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="size-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="h-5 w-5 text-amber-400"
                      />
                    </div>
                    <p className="text-white text-sm font-semibold">
                      Video Locked
                    </p>
                    <p className="text-gray-500 text-xs px-8 text-center">
                      Upgrade to Premium to add and display unlimited videos
                    </p>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs cursor-pointer hover:bg-amber-500/20 mt-1">
                      <FontAwesomeIcon
                        icon={faCrown}
                        className="h-2.5 w-2.5 mr-1"
                      />{" "}
                      Unlock Videos
                    </Badge>
                  </div>
                </div>
              </Card>
            </section>

            <Separator className="bg-white/8" />

            {/* ── WHERE I'VE PLAYED ── */}
            <section>
              <SectionHeading>Where I&apos;ve Played</SectionHeading>
              <div className="flex flex-col gap-2">
                {VENUES.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="size-9 rounded-md bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="h-3.5 w-3.5 text-h_red"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{v.name}</p>
                      <p className="text-gray-500 text-xs">
                        {v.city}, {v.country}
                      </p>
                    </div>
                    <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs shrink-0">
                      {v.count}x
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── REVIEWS ── */}
            <section>
              <SectionHeading sub={`${DJ.ratingCount} verified reviews`}>
                Crowd Feedback
              </SectionHeading>
              <div className="flex flex-col sm:flex-row gap-6 mb-7 p-5 rounded-xl bg-h_blackLight/30 border border-white/5">
                <div className="flex flex-col items-center justify-center shrink-0 min-w-24 gap-1.5">
                  <span className="text-5xl font-bold text-white leading-none">
                    {DJ.avgRating.toFixed(1)}
                  </span>
                  <Stars rating={DJ.avgRating} size="lg" />
                  <span className="text-xs text-gray-500">
                    {DJ.ratingCount} reviews
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const pct =
                      s === 5
                        ? 78
                        : s === 4
                          ? 14
                          : s === 3
                            ? 5
                            : s === 2
                              ? 2
                              : 1;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-3 text-right">
                          {s}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          className="h-3 w-3 text-amber-400 shrink-0"
                        />
                        <Progress
                          value={pct}
                          className="flex-1 h-1.5 bg-white/8"
                        />
                        <span className="text-xs text-gray-600 w-5 text-right">
                          {Math.round((DJ.ratingCount * pct) / 100)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {REVIEWS.map((r) => (
                  <Card
                    key={r.id}
                    className="bg-h_blackLight/30 border-white/5 p-5 gap-0"
                  >
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
                          <span className="text-xs text-gray-600">
                            {r.date}
                          </span>
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

            <Separator className="bg-white/8" />

            {/* ── BOOKING DETAILS ── */}
            <section>
              <SectionHeading>Booking Details</SectionHeading>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-h_blackLight/30 border-white/8 p-5 gap-0">
                  <h3 className="text-white text-sm font-semibold mb-3">
                    Contact
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="h-3.5 w-3.5 text-h_red shrink-0"
                      />
                      {DJ.bookingEmail}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="h-3.5 w-3.5 text-h_red shrink-0"
                      />
                      {DJ.bookingPhone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FontAwesomeIcon
                        icon={faGlobe}
                        className="h-3.5 w-3.5 text-h_red shrink-0"
                      />
                      {DJ.website}
                    </div>
                  </div>
                </Card>
                <Card className="bg-h_blackLight/30 border-white/8 p-5 gap-0">
                  <h3 className="text-white text-sm font-semibold mb-3">
                    Fee Range
                  </h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">
                      {DJ.minFee}
                    </span>
                    <span className="text-gray-500 text-sm mb-0.5">
                      – {DJ.maxFee}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Per event · varies by duration & travel
                  </p>
                  <Button
                    className="w-full mt-4 bg-h_red hover:bg-h_redDark text-white font-semibold"
                    size="sm"
                  >
                    <FontAwesomeIcon
                      icon={faCalendarDays}
                      className="h-3.5 w-3.5 mr-1.5"
                    />
                    Request Booking
                  </Button>
                </Card>
              </div>
            </section>

            {/* ── LOCKED PREMIUM TEASERS ── */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="font-heading text-xl text-white">
                  Unlock More with Premium
                </h2>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                  <FontAwesomeIcon
                    icon={faCrown}
                    className="h-2.5 w-2.5 mr-1"
                  />
                  Upgrade
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <LockedCard
                  icon={faChartLine}
                  title="Performance Analytics"
                  description="Profile views, booking requests, audience demographics, and growth trends."
                />
                <LockedCard
                  icon={faCheckCircle}
                  title="Verified DJ Badge"
                  description="Stand out with a blue verification badge. Build trust instantly."
                />
                <LockedCard
                  icon={faBolt}
                  title="Featured Placement"
                  description="Appear at the top of DJ searches and get 10x more visibility."
                />
                <LockedCard
                  icon={faFireFlameCurved}
                  title="Booking Insights"
                  description="See who's visiting your profile and convert them into clients."
                />
              </div>
              <div className="mt-6 p-6 rounded-xl border border-amber-500/20 bg-linear-to-br from-amber-500/5 via-transparent to-transparent">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white font-heading text-lg">
                      Ready to grow your career?
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      DJs on Premium get 3x more booking requests.
                    </p>
                  </div>
                  <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold shrink-0">
                    <FontAwesomeIcon
                      icon={faCrown}
                      className="h-3.5 w-3.5 mr-2"
                    />
                    Go Premium
                  </Button>
                </div>
              </div>
            </section>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-28 flex flex-col gap-5 h-fit">
            {/* Book CTA */}
            <Card className="bg-linear-to-b from-h_red/10 to-transparent border-h_red/20 p-5 gap-0">
              <h3 className="text-white font-semibold text-sm mb-1">
                Book {DJ.stageName}
              </h3>
              <p className="text-gray-400 text-xs mb-4">
                For clubs, festivals, events & more
              </p>
              <Button className="w-full bg-h_red hover:bg-h_redDark text-white font-semibold mb-2">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="h-3.5 w-3.5 mr-1.5"
                />
                Book / Hire DJ
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/15 text-gray-300 hover:bg-white/5"
              >
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="h-3.5 w-3.5 mr-1.5"
                />
                Send Inquiry
              </Button>
            </Card>

            {/* Upcoming Events */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-3">
                Upcoming Events
              </h3>
              <div className="flex flex-col gap-2">
                {EVENTS.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-h_blackLight/30 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-md bg-h_red/10 border border-h_red/20 flex flex-col items-center justify-center">
                      <span className="text-h_red text-[9px] font-bold uppercase leading-none">
                        {format(new Date(e.date), "MMM")}
                      </span>
                      <span className="text-white text-sm font-bold leading-none mt-0.5">
                        {format(new Date(e.date), "d")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {e.title}
                      </p>
                      <p className="text-gray-500 text-[10px] mt-0.5 truncate">
                        {[e.venue, e.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Specializes In */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faMusic}
                  className="h-3 w-3 text-h_red"
                />
                Specializes In
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {DJ.djTypes.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-white/15 text-gray-300 text-xs"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Locked Analytics teaser */}
            <div className="p-4 rounded-xl border border-white/8 bg-white/2">
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon
                  icon={faLock}
                  className="h-3.5 w-3.5 text-amber-400"
                />
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Analytics
                </h3>
                <Badge className="ml-auto bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                  Premium
                </Badge>
              </div>
              <div className="flex flex-col gap-2 opacity-40 pointer-events-none select-none">
                {["Profile Views", "Booking Requests", "Follower Growth"].map(
                  (m) => (
                    <div key={m} className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">{m}</span>
                      <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-h_red rounded-full"
                          style={{ width: `${Math.random() * 60 + 30}%` }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Profile completion prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-medium">
                  Profile Strength
                </span>
                <span className="text-white text-xs font-bold">68%</span>
              </div>
              <Progress value={68} className="h-1.5 bg-white/8 mb-2" />
              <p className="text-gray-500 text-xs">
                Add more photos & connect Spotify to reach 100%.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
