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
  MapPin,
  Star,
  Users,
  CalendarDays,
  UserPlus,
  Share2,
  Play,
  Music,
  Video,
  Image as ImageIcon,
  CircleCheck,
  ChartLine,
  Crown,
  Mail,
  Phone,
  Globe,
  Trophy,
  Flame,
  Headphones,
  TrendingUp,
  Landmark,
  Newspaper,
  MicVocal,
  BriefcaseBusiness,
  Rocket,
  Zap,
  Eye,
  CalendarCheck2,
  Handshake,
} from "lucide-react";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import MediaVideoModal from "@/components/dj-profile/MediaVideoModal";
import MediaAudioPlayer from "@/components/dj-profile/MediaAudioPlayer";
import MediaGalleryLightbox from "@/components/dj-profile/MediaGalleryLightbox";
import ProfileAbout from "@/components/dj-profile/ProfileAbout";
import ProfileReviews from "@/components/dj-profile/ProfileReviews";
import ProfileVenues from "@/components/dj-profile/ProfileVenues";
import ProfileEventsSidebar from "@/components/dj-profile/ProfileEventsSidebar";
import {
  SOCIAL_ICONS,
  Stars,
  SectionHeading,
  formatPlays,
} from "@/components/dj-profile/dj-profile-shared";
import {
  PREMIUM_DEFAULT_DJ,
  PREMIUM_DEFAULT_EVENTS,
  PREMIUM_DEFAULT_VENUES,
  PREMIUM_DEFAULT_REVIEWS,
  PREMIUM_DEFAULT_MEDIA,
  PREMIUM_DEFAULT_ENDORSEMENTS,
  PREMIUM_DEFAULT_HIGHLIGHTS,
  PREMIUM_DEFAULT_PRESS,
  PREMIUM_DEFAULT_PACKAGES,
  PREMIUM_DEFAULT_CALENDAR_DAYS,
  PREMIUM_DEFAULT_MIXES,
  PREMIUM_DEFAULT_SPOTLIGHT,
  type PremiumMediaItem,
} from "@/data/dj-profile-defaults";
import {
  mapPremiumDjToProps,
  mapPremiumEventsFromData,
  mapPremiumVenuesFromData,
  mapPremiumReviewsFromData,
  mapPremiumMediaFromData,
  mapEndorsementsFromData,
  mapHighlightsFromData,
  mapPressFromData,
  mapPackagesFromData,
  mapMixesFromData,
  buildCalendarFromData,
  getCalendarMonthLabel,
} from "@/lib/dj-profile-mappers";

function StatPill({
  value,
  label,
  trend,
}: {
  value: string;
  label: string;
  trend?: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-white/3 border border-white/8">
      <span className="text-2xl font-bold text-white">{value}</span>
      {trend && (
        <span className="text-emerald-400 text-[10px] font-semibold">
          {trend}
        </span>
      )}
      <span className="text-gray-500 text-xs mt-1 text-center">{label}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfilePremium({
  djData,
  viewMode = "fan",
}: {
  djData?: DjDemoData;
  viewMode?: ViewMode;
} = {}) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [mediaTab, setMediaTab] = useState<"photos" | "videos" | "mixes">(
    "photos",
  );

  const DJ = djData ? mapPremiumDjToProps(djData) : PREMIUM_DEFAULT_DJ;
  const EVENTS = djData
    ? mapPremiumEventsFromData(djData)
    : PREMIUM_DEFAULT_EVENTS;
  const VENUES = djData
    ? mapPremiumVenuesFromData(djData)
    : PREMIUM_DEFAULT_VENUES;
  const REVIEWS = djData
    ? mapPremiumReviewsFromData(djData)
    : PREMIUM_DEFAULT_REVIEWS;
  const MEDIA = djData
    ? mapPremiumMediaFromData(djData)
    : PREMIUM_DEFAULT_MEDIA;
  const ENDORSEMENTS = djData
    ? mapEndorsementsFromData(djData)
    : PREMIUM_DEFAULT_ENDORSEMENTS;
  const HIGHLIGHTS = djData
    ? mapHighlightsFromData(djData)
    : PREMIUM_DEFAULT_HIGHLIGHTS;
  const PRESS = djData ? mapPressFromData(djData) : PREMIUM_DEFAULT_PRESS;
  const PACKAGES = djData
    ? mapPackagesFromData(djData)
    : PREMIUM_DEFAULT_PACKAGES;
  const CALENDAR_DAYS = djData
    ? buildCalendarFromData(djData)
    : PREMIUM_DEFAULT_CALENDAR_DAYS;
  const MIXES = djData ? mapMixesFromData(djData) : PREMIUM_DEFAULT_MIXES;
  const calendarLabel = djData
    ? getCalendarMonthLabel(djData)
    : "September 2025";
  const SPOTLIGHT = djData ? djData.spotlight : PREMIUM_DEFAULT_SPOTLIGHT;
  const location = `${DJ.city}, ${DJ.country}`;

  return (
    <div className="min-h-screen bg-black">
      {/* ── PREMIUM HERO ── */}
      <section className="w-full">
        <div className="relative w-full h-72 md:h-105 overflow-hidden">
          <Image
            src={DJ.coverImage}
            alt="cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-black/10" />
          <div className="absolute inset-0 bg-linear-to-r from-h_red/10 to-transparent" />
          {/* Premium ambient glow */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-20 sm:-mt-16 pb-5">
            {/* Avatar with premium ring */}
            <div className="relative shrink-0 z-10">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ring-amber-400 ring-offset-2 ring-offset-black">
                <Image
                  src={DJ.avatar}
                  alt={DJ.stageName}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-amber-400 border-2 border-black flex items-center justify-center">
                <Crown className="h-3.5 w-3.5 text-black" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-1 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="font-heading text-3xl md:text-4xl text-white leading-none z-10">
                  Dj {DJ.stageName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/25 text-xs h-5.5">
                    <CircleCheck className="h-2.5 w-2.5 mr-1" />
                    Verified
                  </Badge>
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs h-5.5">
                    <Crown className="h-2.5 w-2.5 mr-1" />
                    Premium
                  </Badge>
                </div>
              </div>
              <p className="text-gray-400 text-sm flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-h_red" /> {location}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:pb-2 flex-wrap">
              <Button className="bg-h_red hover:bg-h_redDark text-white font-semibold px-5">
                <CalendarCheck2 className="h-3.5 w-3.5 mr-1.5" />
                Book DJ
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/5"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Follow
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <Share2 className="h-4 w-4" />
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

          {/* Premium stats bar — 6 metrics */}
          <div className="grid grid-cols-3 md:grid-cols-6 py-5 divide-x divide-white/10">
            {[
              {
                val: DJ.followerCount.toLocaleString(),
                label: "Followers",
                icon: Users,
              },
              {
                val: DJ.avgRating.toFixed(1),
                label: `${DJ.ratingCount} reviews`,
                icon: Star,
                amber: true,
              },
              {
                val: DJ.eventsCount.toString(),
                label: "Events",
                icon: CalendarDays,
              },
              {
                val: `${DJ.responseRate}%`,
                label: "Response Rate",
                icon: Zap,
                green: true,
              },
              {
                val: `${DJ.bookingSuccessRate}%`,
                label: "Booking Rate",
                icon: Handshake,
                green: true,
              },
              {
                val: DJ.profileViews.toLocaleString(),
                label: "Monthly Views",
                icon: Eye,
              },
            ].map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center py-1">
                  <span className="text-xl md:text-2xl font-bold text-white">
                    {s.val}
                  </span>
                  <span
                    className={cn(
                      "text-xs flex items-center gap-1 mt-1",
                      s.amber
                        ? "text-amber-400"
                        : s.green
                          ? "text-emerald-400"
                          : "text-gray-500",
                    )}
                  >
                    <SIcon className="h-2.5 w-2.5" />
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Separator className="bg-white/10" />
        </div>
      </section>

      {/* ── PAGE BODY ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── MAIN COLUMN ── */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            {/* ── SPOTLIGHT ── */}
            <section>
              <SectionHeading sub="Curated featured content">
                Spotlight
              </SectionHeading>
              <div className="grid sm:grid-cols-2 gap-4">
                <MediaAudioPlayer
                  audioUrl={SPOTLIGHT.featuredMix.audioUrl}
                  title={SPOTLIGHT.featuredMix.title}
                >
                  <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all gap-0">
                    <div className="relative h-44 bg-linear-to-br from-h_red/20 to-black">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-h_red/20 border border-h_red/30 flex items-center justify-center group-hover:bg-h_red/30 transition-colors">
                          <Play className="h-5 w-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/60 text-gray-300 border-white/10 text-[10px]">
                          <Headphones className="h-2.5 w-2.5 mr-1" />
                          Featured Mix
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-sm font-semibold">
                        {SPOTLIGHT.featuredMix.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {SPOTLIGHT.featuredMix.duration} ·{" "}
                        {formatPlays(SPOTLIGHT.featuredMix.plays)} plays
                      </p>
                    </div>
                  </Card>
                </MediaAudioPlayer>
                <MediaVideoModal
                  videoUrl={SPOTLIGHT.featuredVideo.videoUrl}
                  thumbnail={SPOTLIGHT.featuredVideo.thumbnail}
                  title={SPOTLIGHT.featuredVideo.title}
                >
                  <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all gap-0">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={SPOTLIGHT.featuredVideo.thumbnail}
                        alt="video"
                        fill
                        className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                          <Play className="h-5 w-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/60 text-gray-300 border-white/10 text-[10px]">
                          <Video className="h-2.5 w-2.5 mr-1" />
                          {SPOTLIGHT.featuredVideo.subtitle}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-sm font-semibold">
                        {SPOTLIGHT.featuredVideo.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {SPOTLIGHT.featuredVideo.duration} ·{" "}
                        {formatPlays(SPOTLIGHT.featuredVideo.views)} views
                      </p>
                    </div>
                  </Card>
                </MediaVideoModal>
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── PERFORMANCE INSIGHTS (owner-only in fan view) ── */}
            {viewMode !== "fan" && (
              <section>
                <SectionHeading sub="Last 30 days · Premium analytics">
                  Performance Insights
                </SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <StatPill value="3,240" label="Profile Views" trend="+24%" />
                  <StatPill value="47" label="Booking Requests" trend="+18%" />
                  <StatPill value="+312" label="New Followers" trend="+9%" />
                  <StatPill value="94%" label="Booking Rate" />
                </div>
                <Card className="bg-h_blackLight/30 border-white/8 p-5 gap-0">
                  <h3 className="text-white text-sm font-semibold mb-4">
                    Top Cities (Audience)
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { city: "London", pct: 28 },
                      { city: "Lagos", pct: 22 },
                      { city: "Berlin", pct: 17 },
                      { city: "New York", pct: 13 },
                      { city: "Ibiza", pct: 10 },
                    ].map((c) => (
                      <div key={c.city} className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs w-20 shrink-0">
                          {c.city}
                        </span>
                        <Progress
                          value={c.pct}
                          className="flex-1 h-1.5 bg-white/8"
                        />
                        <span className="text-gray-500 text-xs w-8 text-right">
                          {c.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Audience Age
                    </h3>
                    {[
                      ["18–24", 35],
                      ["25–34", 44],
                      ["35–44", 16],
                      ["45+", 5],
                    ].map(([g, v]) => (
                      <div key={g} className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-400 text-xs w-12 shrink-0">
                          {g}
                        </span>
                        <Progress
                          value={Number(v)}
                          className="flex-1 h-1 bg-white/8"
                        />
                        <span className="text-gray-500 text-xs w-7 text-right">
                          {v}%
                        </span>
                      </div>
                    ))}
                  </Card>
                  <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Profile Traffic
                    </h3>
                    {[
                      ["Direct", 42],
                      ["Search", 31],
                      ["Social", 18],
                      ["Referral", 9],
                    ].map(([src, v]) => (
                      <div key={src} className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-400 text-xs w-14 shrink-0">
                          {src}
                        </span>
                        <Progress
                          value={Number(v)}
                          className="flex-1 h-1 bg-white/8"
                        />
                        <span className="text-gray-500 text-xs w-7 text-right">
                          {v}%
                        </span>
                      </div>
                    ))}
                  </Card>
                </div>
              </section>
            )}

            <Separator className="bg-white/8" />

            {/* ── AVAILABILITY CALENDAR ── */}
            <section>
              <SectionHeading sub={`${calendarLabel} availability`}>
                Availability Calendar
              </SectionHeading>
              <div className="flex items-center gap-4 mb-4">
                {[
                  { color: "bg-emerald-500", label: "Available" },
                  { color: "bg-h_red", label: "Booked" },
                  { color: "bg-amber-500", label: "Tentative" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={cn("size-2.5 rounded-full", l.color)} />
                    <span className="text-gray-400 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
              <Card className="bg-h_blackLight/30 border-white/8 p-5 gap-0">
                <div className="grid grid-cols-7 gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-center text-gray-600 text-[10px] font-semibold pb-1"
                      >
                        {d}
                      </div>
                    ),
                  )}
                  {/* Empty cells for day alignment */}
                  {Array.from({ length: 0 }).map((_, i) => (
                    <div key={`e${i}`} />
                  ))}
                  {CALENDAR_DAYS.map(({ day, status }) => (
                    <div
                      key={day}
                      className={cn(
                        "h-9 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer transition-all",
                        status === "booked" &&
                          "bg-h_red/20 text-h_red border border-h_red/30",
                        status === "tentative" &&
                          "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                        status === "available" &&
                          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25",
                        status === "free" && "text-gray-600 hover:bg-white/5",
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <Separator className="bg-white/8" />

            {/* ── BOOKING PACKAGES ── */}
            <section>
              <SectionHeading sub="Tailored options for every event type">
                Booking Packages
              </SectionHeading>
              <div className="grid sm:grid-cols-3 gap-4">
                {PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.name}
                    className={cn(
                      "relative overflow-hidden border-white/8 p-5 flex flex-col gap-0",
                      pkg.featured
                        ? "border-amber-500/30 bg-linear-to-b from-amber-500/10 to-h_blackLight/30"
                        : "bg-h_blackLight/30",
                    )}
                  >
                    {pkg.featured && (
                      <Badge className="absolute top-3 right-3 bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]">
                        Most Popular
                      </Badge>
                    )}
                    <div className="size-10 rounded-lg bg-h_red/10 border border-h_red/20 flex items-center justify-center mb-3">
                      {(() => {
                        const PkgIcon = pkg.icon;
                        return <PkgIcon className="h-4 w-4 text-h_red" />;
                      })()}
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {pkg.name}
                    </p>
                    <p className="text-h_red text-lg font-bold mt-1">
                      {pkg.price}
                    </p>
                    <p className="text-gray-500 text-xs mb-3">{pkg.duration}</p>
                    <ul className="flex flex-col gap-1.5 flex-1">
                      {pkg.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1.5 text-gray-400 text-xs"
                        >
                          <CircleCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4 bg-h_red hover:bg-h_redDark text-white font-semibold"
                      size="sm"
                    >
                      Enquire
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            <ProfileAbout
              bio={DJ.bio}
              djTypes={DJ.djTypes}
              bioExpanded={bioExpanded}
              onToggleBio={() => setBioExpanded(!bioExpanded)}
            />

            <Separator className="bg-white/8" />

            {/* ── EXTENDED MEDIA LIBRARY ── */}
            <section>
              <SectionHeading sub="Full media library · Unlimited with Premium">
                Media Library
              </SectionHeading>
              <div className="flex gap-2 mb-4">
                {(["photos", "videos", "mixes"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMediaTab(tab)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
                      mediaTab === tab
                        ? "bg-h_red text-white"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {mediaTab === "photos" && (
                <MediaGalleryLightbox
                  photos={MEDIA.filter((m) => m.type === "photo")}
                />
              )}
              {mediaTab === "videos" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {MEDIA.filter((m) => m.type === "video").map((m) => (
                    <MediaVideoModal
                      key={m.id}
                      videoUrl={m.videoUrl ?? ""}
                      thumbnail={m.url}
                      title={m.title ?? "Video"}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden ring-1 ring-white/5 hover:ring-h_red/40 transition-all cursor-pointer group">
                        <Image
                          src={m.url}
                          alt="video"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="size-12 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </MediaVideoModal>
                  ))}
                </div>
              )}
              {mediaTab === "mixes" && (
                <div className="flex flex-col gap-3">
                  {MIXES.map((mix) => (
                    <MediaAudioPlayer
                      key={mix.title}
                      audioUrl={mix.audioUrl}
                      title={mix.title}
                    >
                      <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0 flex flex-row items-center cursor-pointer hover:border-white/15 transition-colors">
                        <div className="size-12 rounded-lg bg-linear-to-br from-h_red/30 to-h_redDark/10 border border-white/8 flex items-center justify-center shrink-0 mr-4">
                          <Music className="h-4 w-4 text-h_red" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold">
                            {mix.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {mix.platform} · {mix.duration} · {mix.plays} plays
                          </p>
                        </div>
                        <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <Play className="h-3 w-3 ml-0.5" />
                        </div>
                      </Card>
                    </MediaAudioPlayer>
                  ))}
                </div>
              )}
            </section>

            <Separator className="bg-white/8" />

            {/* ── CAREER HIGHLIGHTS ── */}
            <section>
              <SectionHeading sub="Key milestones and achievements">
                Career Highlights
              </SectionHeading>
              <div className="relative flex flex-col gap-0">
                {HIGHLIGHTS.map((h, i) => {
                  const HIcon = h.icon;
                  return (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="size-9 rounded-full bg-h_red/10 border border-h_red/20 flex items-center justify-center shrink-0">
                          <HIcon className="h-3.5 w-3.5 text-h_red" />
                        </div>
                        {i < HIGHLIGHTS.length - 1 && (
                          <div className="w-px flex-1 bg-white/8 mt-2" />
                        )}
                      </div>
                      <div className="pb-1 pt-1.5">
                        <p className="text-white text-sm font-semibold">
                          {h.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{h.year}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── INDUSTRY ENDORSEMENTS ── */}
            <section>
              <SectionHeading sub="What industry professionals say">
                Industry Endorsements
              </SectionHeading>
              <div className="flex flex-col gap-4">
                {ENDORSEMENTS.map((e) => (
                  <Card
                    key={e.name}
                    className="bg-h_blackLight/30 border-white/8 p-5 gap-0"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-11 ring-1 ring-white/10 shrink-0">
                        <AvatarImage src={e.avatar} />
                        <AvatarFallback className="bg-h_blackLight text-white text-xs">
                          {e.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white text-sm font-semibold">
                            {e.name}
                          </span>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                            <Landmark className="h-2 w-2 mr-1" />
                            Venue
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-xs mb-2">{e.role}</p>
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                          &ldquo;{e.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── PRESS & MEDIA ── */}
            <section>
              <SectionHeading sub="Interviews, features, and podcasts">
                Press &amp; Media
              </SectionHeading>
              <div className="grid sm:grid-cols-2 gap-3">
                {PRESS.map((p) => {
                  const PressIcon = p.icon;
                  return (
                    <Card
                      key={p.title}
                      className="bg-h_blackLight/30 border-white/8 p-4 gap-0 hover:border-white/15 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-9 rounded-md bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                          <PressIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-h_red text-xs font-bold">
                              {p.outlet}
                            </span>
                            <Badge className="bg-white/5 text-gray-500 border-white/8 text-[10px]">
                              {p.type}
                            </Badge>
                          </div>
                          <p className="text-white text-sm font-medium line-clamp-2">
                            {p.title}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">{p.date}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-white/8" />

            <ProfileVenues venues={VENUES} />

            <Separator className="bg-white/8" />

            <ProfileReviews
              avgRating={DJ.avgRating}
              ratingCount={DJ.ratingCount}
              reviews={REVIEWS}
            />
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-28 flex flex-col gap-5 h-fit">
            {/* Priority Booking CTA */}
            <Card className="border-amber-500/25 overflow-hidden gap-0 bg-linear-to-b from-amber-500/8 to-h_blackLight/30">
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    Priority Booking
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  Book {DJ.stageName}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">
                    Responding within 2 hours
                  </span>
                </div>
                <Button className="w-full bg-h_red hover:bg-h_redDark text-white font-semibold mb-2">
                  <CalendarCheck2 className="h-3.5 w-3.5 mr-1.5" />
                  Book / Hire DJ
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/15 text-gray-300 hover:bg-white/5"
                >
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Send Inquiry
                </Button>
              </div>
              <div className="px-5 py-3 border-t border-white/5 flex justify-between">
                <div className="text-center">
                  <p className="text-white text-sm font-bold">
                    {DJ.responseRate}%
                  </p>
                  <p className="text-gray-500 text-[10px]">Response Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-bold">
                    {DJ.bookingSuccessRate}%
                  </p>
                  <p className="text-gray-500 text-[10px]">Booking Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-bold">&lt;2h</p>
                  <p className="text-gray-500 text-[10px]">Reply Time</p>
                </div>
              </div>
            </Card>

            <ProfileEventsSidebar events={EVENTS} />

            <Separator className="bg-white/8" />

            {/* Professional Contacts */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <BriefcaseBusiness className="h-3 w-3 text-h_red" />
                Professional Team
              </h3>
              <div className="flex flex-col gap-2">
                <Card className="bg-h_blackLight/30 border-white/8 p-3 gap-0">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Manager
                  </p>
                  <p className="text-white text-xs font-semibold">
                    {DJ.manager.name}
                  </p>
                  <a
                    href={`mailto:${DJ.manager.email}`}
                    className="text-gray-400 text-[11px] hover:text-h_red transition-colors truncate block mt-0.5"
                  >
                    {DJ.manager.email}
                  </a>
                </Card>
                <Card className="bg-h_blackLight/30 border-white/8 p-3 gap-0">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Booking Agent
                  </p>
                  <p className="text-white text-xs font-semibold">
                    {DJ.agent.name}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    {DJ.agent.agency}
                  </p>
                  <a
                    href={`mailto:${DJ.agent.email}`}
                    className="text-gray-400 text-[11px] hover:text-h_red transition-colors truncate block mt-0.5"
                  >
                    {DJ.agent.email}
                  </a>
                </Card>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Fee Range */}
            <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
              <h3 className="text-white text-sm font-semibold mb-3">
                Fee Range
              </h3>
              <div className="flex items-end gap-2 mb-1">
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
            </Card>

            {/* Analytics snapshot (owner-only in fan view) */}
            {viewMode !== "fan" && (
              <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0">
                <div className="flex items-center gap-2 mb-3">
                  <ChartLine className="h-3.5 w-3.5 text-emerald-400" />
                  <h3 className="text-white text-xs font-semibold">
                    This Month
                  </h3>
                </div>
                {[
                  { label: "Profile Views", val: "3,240", trend: "+24%" },
                  { label: "Booking Requests", val: "47", trend: "+18%" },
                  { label: "New Followers", val: "312", trend: "+9%" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between mb-2"
                  >
                    <span className="text-gray-400 text-xs">{m.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-xs font-semibold">
                        {m.val}
                      </span>
                      <span className="text-emerald-400 text-[10px]">
                        {m.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
