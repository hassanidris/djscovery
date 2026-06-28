"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";
import { uploadDjCover } from "@/lib/actions/dj-upload";
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
  Camera,
  Loader2,
} from "lucide-react";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import MediaVideoModal from "@/components/dj-profile/MediaVideoModal";
import MediaAudioPlayer from "@/components/dj-profile/MediaAudioPlayer";
import MediaGalleryLightbox from "@/components/dj-profile/MediaGalleryLightbox";
import ProfileAbout from "@/components/dj-profile/ProfileAbout";
import ProfileReviews from "@/components/dj-profile/ProfileReviews";
import ProfileVenues from "@/components/dj-profile/ProfileVenues";
import ProfileEventsSidebar from "@/components/dj-profile/ProfileEventsSidebar";
import { ReputationBadge } from "@/components/dj-profile/ReputationBadge";
import { ScoreBreakdown } from "@/components/dj-profile/ScoreBreakdown";
import {
  SOCIAL_ICONS,
  Stars,
  SectionHeading,
  formatPlays,
} from "@/components/dj-profile/dj-profile-shared";
import SaveDjButton from "@/components/dj-profile/SaveDjButton";
import FollowDjButton from "@/components/dj-profile/FollowDjButton";
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
    <div className="flex flex-col items-center rounded-xl border border-white/8 bg-white/3 p-4">
      <span className="text-2xl font-bold text-white">{value}</span>
      {trend && (
        <span className="text-[11px] font-semibold text-emerald-400">
          {trend}
        </span>
      )}
      <span className="mt-1 text-center text-xs text-gray-500">{label}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfilePremium({
  djData,
  viewMode = "fan",
  isFollowed = false,
  djUserId,
  isFollowing = false,
  reputationScore,
  reputationDetail,
  status,
}: {
  djData?: DjDemoData;
  viewMode?: ViewMode;
  isFollowed?: boolean;
  djUserId?: string;
  isFollowing?: boolean;
  reputationScore?: number;
  reputationDetail?: {
    totalScore: number;
    profileQualityScore: number;
    verificationScore: number;
    reviewScore: number;
    reliabilityScore: number;
    activityScore: number;
    newTalentBoost: number;
  } | null;
  status?: string;
} = {}) {
  const djProfileId = djData ? parseInt(djData.id) : NaN;
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

  const isOwner = viewMode === "dj-owner";

  const [coverUrl, setCoverUrl] = useState(DJ.coverImage);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadDjCover(fd);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setCoverUrl(result.url);
        toast.success("Cover image updated");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ── PREMIUM HERO ── */}
      <section className="w-full">
        <div className="relative h-72 w-full overflow-hidden md:h-105">
          <Image
            src={coverUrl}
            alt="cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-black/10" />
          <div className="from-h_red/10 absolute inset-0 bg-linear-to-r to-transparent" />
          {/* Premium ambient glow */}
          <div className="absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-black to-transparent" />
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black/70 disabled:opacity-50"
              >
                {isUploadingCover ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
                Change Cover
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverChange}
              />
            </>
          )}
        </div>

        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="-mt-20 flex flex-col gap-4 pb-5 sm:-mt-16 sm:flex-row sm:items-end">
            {/* Avatar with premium ring */}
            <div className="relative z-10 shrink-0">
              <div className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-amber-400 ring-offset-2 ring-offset-black sm:h-36 sm:w-36">
                <Image
                  src={DJ.avatar}
                  alt={DJ.stageName}
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-black bg-amber-400">
                <Crown className="h-3.5 w-3.5 text-black" />
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-1 sm:pb-2">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <h1 className="font-heading z-10 text-2xl font-bold tracking-tight text-white md:text-4xl">
                  Dj {DJ.stageName}
                </h1>
                <div className="flex items-center gap-1.5">
                  {status === "APPROVED" && (
                    <Badge className="h-5.5 border-blue-500/25 bg-blue-500/15 text-xs text-blue-400">
                      <CircleCheck className="mr-1 h-2.5 w-2.5" />
                      Verified
                    </Badge>
                  )}
                  <Badge className="h-5.5 border-amber-500/25 bg-amber-500/15 text-xs text-amber-400">
                    <Crown className="mr-1 h-2.5 w-2.5" />
                    Premium
                  </Badge>
                </div>
                {reputationScore !== undefined && (
                  <ReputationBadge
                    score={reputationScore}
                    variant="subtle"
                    showScore={false}
                  />
                )}
                {isOwner && reputationDetail && (
                  <div className="mt-2">
                    <ScoreBreakdown reputationDetail={reputationDetail} />
                  </div>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-gray-400">
                <MapPin className="text-h_red h-3 w-3" /> {location}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:pb-2">
              <Button className="bg-h_red hover:bg-h_redDark px-5 font-semibold text-white">
                <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
                Book DJ
              </Button>
              {viewMode === "fan" && djUserId ? (
                <FollowDjButton djUserId={djUserId} isFollowing={isFollowing} />
              ) : viewMode === "fan" ? (
                <Button
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/5"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Follow
                </Button>
              ) : null}
              {viewMode === "fan" && !isNaN(djProfileId) && (
                <SaveDjButton
                  djProfileId={djProfileId}
                  isFollowed={isFollowed}
                />
              )}
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
          <div className="mb-4 flex flex-wrap gap-2">
            {DJ.genres.map((g) => (
              <Badge
                key={g}
                className="bg-h_redDark/50 h-6 border-0 text-red-100"
              >
                {g}
              </Badge>
            ))}
          </div>

          {/* Social */}
          <div className="mb-6 flex items-center gap-2">
            {DJ.socialLinks.map((l) => {
              const icon = SOCIAL_ICONS[l.platform];
              if (!icon) return null;
              return (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <FontAwesomeIcon icon={icon} className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <Separator className="bg-white/10" />

          {/* Premium stats bar — 6 metrics */}
          <div className="grid grid-cols-3 divide-x divide-white/10 py-5 md:grid-cols-6">
            {[
              {
                val: formatNumber(DJ.followerCount),
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
                val: formatNumber(DJ.profileViews),
                label: "Monthly Views",
                icon: Eye,
              },
            ].map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center py-1">
                  <span className="text-xl font-bold text-white md:text-2xl">
                    {s.val}
                  </span>
                  <span
                    className={cn(
                      "mt-1 flex items-center gap-1 text-xs",
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
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── MAIN COLUMN ── */}
          <div className="flex flex-col gap-12 lg:col-span-2">
            {/* ── MOBILE BOOK CTA ── */}
            <div className="lg:hidden">
              <Card className="to-h_blackLight/30 gap-0 overflow-hidden border-amber-500/25 bg-linear-to-b from-amber-500/8 p-5">
                <div className="mb-1 flex items-center gap-2">
                  <Rocket className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                    Priority Booking
                  </span>
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Book {DJ.stageName}
                </h3>
                <div className="mb-4 flex items-center gap-2">
                  <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">
                    Responding within 2 hours
                  </span>
                </div>
                <Button className="bg-h_red hover:bg-h_redDark mb-2 w-full font-semibold text-white">
                  <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
                  Book / Hire DJ
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/15 text-gray-300 hover:bg-white/5"
                >
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Send Inquiry
                </Button>
              </Card>
            </div>

            <ProfileAbout
              bio={DJ.bio}
              djTypes={DJ.djTypes}
              bioExpanded={bioExpanded}
              onToggleBio={() => setBioExpanded(!bioExpanded)}
            />

            <Separator className="bg-white/8" />

            {/* ── SPOTLIGHT ── */}
            <section>
              <SectionHeading sub="Curated featured content">
                Spotlight
              </SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                <MediaAudioPlayer
                  audioUrl={SPOTLIGHT.featuredMix.audioUrl}
                  title={SPOTLIGHT.featuredMix.title}
                >
                  <Card className="bg-h_blackLight/30 group cursor-pointer gap-0 overflow-hidden border-white/8 transition-all hover:border-amber-500/30">
                    <div className="from-h_red/20 relative h-44 bg-linear-to-br to-black">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-h_red/20 border-h_red/30 group-hover:bg-h_red/30 flex size-14 items-center justify-center rounded-full border transition-colors">
                          <Play className="ml-0.5 h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="border-white/10 bg-black/60 text-[11px] text-gray-300">
                          <Headphones className="mr-1 h-2.5 w-2.5" />
                          Featured Mix
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-white">
                        {SPOTLIGHT.featuredMix.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
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
                  <Card className="bg-h_blackLight/30 group cursor-pointer gap-0 overflow-hidden border-white/8 transition-all hover:border-amber-500/30">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={SPOTLIGHT.featuredVideo.thumbnail}
                        alt="video"
                        fill
                        className="object-cover opacity-60 transition-all duration-500 group-hover:scale-105 group-hover:opacity-70"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/50 transition-colors group-hover:bg-black/70">
                          <Play className="ml-0.5 h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="border-white/10 bg-black/60 text-[11px] text-gray-300">
                          <Video className="mr-1 h-2.5 w-2.5" />
                          {SPOTLIGHT.featuredVideo.subtitle}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-white">
                        {SPOTLIGHT.featuredVideo.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
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
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatPill value="3,240" label="Profile Views" trend="+24%" />
                  <StatPill value="47" label="Booking Requests" trend="+18%" />
                  <StatPill value="+312" label="New Followers" trend="+9%" />
                  <StatPill value="94%" label="Booking Rate" />
                </div>
                <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-5">
                  <h3 className="mb-4 text-sm font-semibold text-white">
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
                        <span className="w-20 shrink-0 text-xs text-gray-400">
                          {c.city}
                        </span>
                        <Progress
                          value={c.pct}
                          className="h-1.5 flex-1 bg-white/8"
                        />
                        <span className="w-8 text-right text-xs text-gray-500">
                          {c.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-4">
                    <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Audience Age
                    </h3>
                    {[
                      ["18–24", 35],
                      ["25–34", 44],
                      ["35–44", 16],
                      ["45+", 5],
                    ].map(([g, v]) => (
                      <div key={g} className="mb-1.5 flex items-center gap-2">
                        <span className="w-12 shrink-0 text-xs text-gray-400">
                          {g}
                        </span>
                        <Progress
                          value={Number(v)}
                          className="h-1 flex-1 bg-white/8"
                        />
                        <span className="w-7 text-right text-xs text-gray-500">
                          {v}%
                        </span>
                      </div>
                    ))}
                  </Card>
                  <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-4">
                    <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Profile Traffic
                    </h3>
                    {[
                      ["Direct", 42],
                      ["Search", 31],
                      ["Social", 18],
                      ["Referral", 9],
                    ].map(([src, v]) => (
                      <div key={src} className="mb-1.5 flex items-center gap-2">
                        <span className="w-14 shrink-0 text-xs text-gray-400">
                          {src}
                        </span>
                        <Progress
                          value={Number(v)}
                          className="h-1 flex-1 bg-white/8"
                        />
                        <span className="w-7 text-right text-xs text-gray-500">
                          {v}%
                        </span>
                      </div>
                    ))}
                  </Card>
                </div>
              </section>
            )}

            <Separator className="bg-white/8" />

            {/* ── EXTENDED MEDIA LIBRARY ── */}
            <section>
              <SectionHeading sub="Full media library · Unlimited with Premium">
                Media Library
              </SectionHeading>
              <div className="mb-4 flex gap-2">
                {(["photos", "videos", "mixes"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMediaTab(tab)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all",
                      mediaTab === tab
                        ? "bg-h_red text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white",
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
                <div className="grid gap-3 sm:grid-cols-2">
                  {MEDIA.filter((m) => m.type === "video").map((m) => (
                    <MediaVideoModal
                      key={m.id}
                      videoUrl={m.videoUrl ?? ""}
                      thumbnail={m.url}
                      title={m.title ?? "Video"}
                    >
                      <div className="hover:ring-h_red/40 group relative aspect-video cursor-pointer overflow-hidden rounded-lg ring-1 ring-white/5 transition-all">
                        <Image
                          src={m.url}
                          alt="video"
                          fill
                          className="object-cover opacity-60 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/50 transition-colors group-hover:bg-black/70">
                            <Play className="ml-0.5 h-4 w-4 text-white" />
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
                      <Card className="bg-h_blackLight/30 flex cursor-pointer flex-row items-center gap-0 border-white/8 p-4 transition-colors hover:border-white/15">
                        <div className="from-h_red/30 to-h_redDark/10 mr-4 flex size-12 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-linear-to-br">
                          <Music className="text-h_red h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">
                            {mix.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {mix.platform} · {mix.duration} · {mix.plays} plays
                          </p>
                        </div>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                          <Play className="ml-0.5 h-3 w-3" />
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
                        <div className="bg-h_red/10 border-h_red/20 flex size-9 shrink-0 items-center justify-center rounded-full border">
                          <HIcon className="text-h_red h-3.5 w-3.5" />
                        </div>
                        {i < HIGHLIGHTS.length - 1 && (
                          <div className="mt-2 w-px flex-1 bg-white/8" />
                        )}
                      </div>
                      <div className="pt-1.5 pb-1">
                        <p className="text-sm font-semibold text-white">
                          {h.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">{h.year}</p>
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
                    className="bg-h_blackLight/30 gap-0 border-white/8 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="size-11 shrink-0 ring-1 ring-white/10">
                        <AvatarImage src={e.avatar} />
                        <AvatarFallback className="bg-h_blackLight text-xs text-white">
                          {e.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {e.name}
                          </span>
                          <Badge className="border-blue-500/20 bg-blue-500/10 text-[11px] text-blue-400">
                            <Landmark className="mr-1 h-2 w-2" />
                            Venue
                          </Badge>
                        </div>
                        <p className="mb-2 text-xs text-gray-500">{e.role}</p>
                        <p className="text-sm leading-relaxed text-gray-300 italic">
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
              <div className="grid gap-3 sm:grid-cols-2">
                {PRESS.map((p) => {
                  const PressIcon = p.icon;
                  return (
                    <Card
                      key={p.title}
                      className="bg-h_blackLight/30 group cursor-pointer gap-0 border-white/8 p-4 transition-colors hover:border-white/15"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/8 bg-white/5">
                          <PressIcon className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="text-h_red text-xs font-bold">
                              {p.outlet}
                            </span>
                            <Badge className="border-white/8 bg-white/5 text-[11px] text-gray-500">
                              {p.type}
                            </Badge>
                          </div>
                          <p className="line-clamp-2 text-sm font-medium text-white">
                            {p.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-600">{p.date}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── BOOKING PACKAGES ── */}
            <section>
              <SectionHeading sub="Tailored options for every event type">
                Booking Packages
              </SectionHeading>
              <div className="grid gap-4 sm:grid-cols-3">
                {PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.name}
                    className={cn(
                      "relative flex flex-col gap-0 overflow-hidden border-white/8 p-5",
                      pkg.featured
                        ? "to-h_blackLight/30 border-amber-500/30 bg-linear-to-b from-amber-500/10"
                        : "bg-h_blackLight/30",
                    )}
                  >
                    {pkg.featured && (
                      <Badge className="absolute top-3 right-3 border-amber-500/25 bg-amber-500/15 text-[11px] text-amber-400">
                        Most Popular
                      </Badge>
                    )}
                    <div className="bg-h_red/10 border-h_red/20 mb-3 flex size-10 items-center justify-center rounded-lg border">
                      {(() => {
                        const PkgIcon = pkg.icon;
                        return <PkgIcon className="text-h_red h-4 w-4" />;
                      })()}
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {pkg.name}
                    </p>
                    <p className="text-h_red mt-1 text-lg font-bold">
                      {pkg.price}
                    </p>
                    <p className="mb-3 text-xs text-gray-500">{pkg.duration}</p>
                    <ul className="flex flex-1 flex-col gap-1.5">
                      {pkg.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1.5 text-xs text-gray-400"
                        >
                          <CircleCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="bg-h_red hover:bg-h_redDark mt-4 w-full font-semibold text-white"
                      size="sm"
                    >
                      Enquire
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-white/8" />

            {/* ── AVAILABILITY CALENDAR ── */}
            <section>
              <SectionHeading sub={`${calendarLabel} availability`}>
                Availability Calendar
              </SectionHeading>
              <div className="mb-4 flex items-center gap-4">
                {[
                  { color: "bg-emerald-500", label: "Available" },
                  { color: "bg-h_red", label: "Booked" },
                  { color: "bg-amber-500", label: "Tentative" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={cn("size-2.5 rounded-full", l.color)} />
                    <span className="text-xs text-gray-400">{l.label}</span>
                  </div>
                ))}
              </div>
              <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-5">
                <div className="grid grid-cols-7 gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="pb-1 text-center text-[11px] font-semibold text-gray-600"
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
                        "flex h-9 cursor-pointer items-center justify-center rounded-md text-xs font-medium transition-all",
                        status === "booked" &&
                          "bg-h_red/20 text-h_red border-h_red/30 border",
                        status === "tentative" &&
                          "border border-amber-500/30 bg-amber-500/20 text-amber-400",
                        status === "available" &&
                          "border border-emerald-500/25 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25",
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

            <ProfileVenues venues={VENUES} />

            <Separator className="bg-white/8" />

            {/* ── MOBILE EVENTS ── */}
            <div className="lg:hidden">
              <ProfileEventsSidebar events={EVENTS} />
            </div>

            <div className="lg:hidden">
              <Separator className="bg-white/8" />
            </div>

            <ProfileReviews
              avgRating={DJ.avgRating}
              ratingCount={DJ.ratingCount}
              reviews={REVIEWS}
            />
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-28 flex h-fit flex-col gap-5">
            {/* Priority Booking CTA — desktop only; mobile version is inline above */}
            <div className="hidden lg:block">
              <Card className="to-h_blackLight/30 gap-0 overflow-hidden border-amber-500/25 bg-linear-to-b from-amber-500/8">
                <div className="px-5 pt-5 pb-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Rocket className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                      Priority Booking
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-white">
                    Book {DJ.stageName}
                  </h3>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                      Responding within 2 hours
                    </span>
                  </div>
                  <Button className="bg-h_red hover:bg-h_redDark mb-2 w-full font-semibold text-white">
                    <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
                    Book / Hire DJ
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/15 text-gray-300 hover:bg-white/5"
                  >
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    Send Inquiry
                  </Button>
                </div>
                <div className="flex justify-between border-t border-white/5 px-5 py-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">
                      {DJ.responseRate}%
                    </p>
                    <p className="text-[11px] text-gray-500">Response Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">
                      {DJ.bookingSuccessRate}%
                    </p>
                    <p className="text-[11px] text-gray-500">Booking Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">&lt;2h</p>
                    <p className="text-[11px] text-gray-500">Reply Time</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Events — desktop only; mobile version is inline above */}
            <div className="hidden lg:block">
              <ProfileEventsSidebar events={EVENTS} />
            </div>

            <Separator className="bg-white/8" />

            {/* Professional Contacts */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <BriefcaseBusiness className="text-h_red h-3 w-3" />
                Professional Team
              </h3>
              <div className="flex flex-col gap-2">
                <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-3">
                  <p className="mb-1 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Manager
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {DJ.manager.name}
                  </p>
                  <a
                    href={`mailto:${DJ.manager.email}`}
                    className="hover:text-h_red mt-0.5 block truncate text-xs text-gray-400 transition-colors"
                  >
                    {DJ.manager.email}
                  </a>
                </Card>
                <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-3">
                  <p className="mb-1 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Booking Agent
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {DJ.agent.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {DJ.agent.agency}
                  </p>
                  <a
                    href={`mailto:${DJ.agent.email}`}
                    className="hover:text-h_red mt-0.5 block truncate text-xs text-gray-400 transition-colors"
                  >
                    {DJ.agent.email}
                  </a>
                </Card>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Fee Range */}
            <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Fee Range
              </h3>
              <div className="mb-1 flex items-end gap-2">
                <span className="text-2xl font-bold text-white">
                  {DJ.minFee}
                </span>
                <span className="mb-0.5 text-sm text-gray-500">
                  – {DJ.maxFee}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Per event · varies by duration & travel
              </p>
            </Card>

            {/* Analytics snapshot (owner-only in fan view) */}
            {viewMode !== "fan" && (
              <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ChartLine className="h-3.5 w-3.5 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-white">
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
                    className="mb-2 flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-400">{m.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {m.val}
                      </span>
                      <span className="text-[11px] text-emerald-400">
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
