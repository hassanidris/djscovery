"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MapPin,
  Users,
  CalendarDays,
  UserPlus,
  Share2,
  Play,
  Music,
  Video,
  Headphones,
  CalendarCheck2,
  Mail,
  Star,
  Crown,
  Lock,
  ChartLine,
  Trophy,
  Newspaper,
  BriefcaseBusiness,
} from "lucide-react";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import MediaAudioPlayer from "@/components/dj-profile/MediaAudioPlayer";
import MediaVideoModal from "@/components/dj-profile/MediaVideoModal";
import MediaGalleryLightbox from "@/components/dj-profile/MediaGalleryLightbox";
import ProfileAbout from "@/components/dj-profile/ProfileAbout";
import ProfileReviews from "@/components/dj-profile/ProfileReviews";
import ProfileVenues from "@/components/dj-profile/ProfileVenues";
import ProfileEventsSidebar from "@/components/dj-profile/ProfileEventsSidebar";
import {
  SOCIAL_ICONS,
  SectionHeading,
} from "@/components/dj-profile/dj-profile-shared";
import {
  FREE_DEFAULT_DJ,
  FREE_DEFAULT_EVENTS,
  FREE_DEFAULT_VENUES,
  FREE_DEFAULT_REVIEWS,
  FREE_DEFAULT_MEDIA,
  FREE_DEFAULT_FEATURED_MIX,
} from "@/data/dj-profile-defaults";
import {
  mapFreeDjToProps,
  mapFreeEventsFromData,
  mapFreeVenuesFromData,
  mapFreeReviewsFromData,
  mapFreeMediaFromData,
  mapFreeFeaturedMix,
} from "@/lib/dj-profile-mappers";

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfileFree({
  djData,
  viewMode = "fan",
}: {
  djData?: DjDemoData;
  viewMode?: ViewMode;
} = {}) {
  const [bioExpanded, setBioExpanded] = useState(false);

  const DJ = djData ? mapFreeDjToProps(djData) : FREE_DEFAULT_DJ;
  const EVENTS = djData ? mapFreeEventsFromData(djData) : FREE_DEFAULT_EVENTS;
  const VENUES = djData ? mapFreeVenuesFromData(djData) : FREE_DEFAULT_VENUES;
  const REVIEWS = djData
    ? mapFreeReviewsFromData(djData)
    : FREE_DEFAULT_REVIEWS;
  const MEDIA = djData ? mapFreeMediaFromData(djData) : FREE_DEFAULT_MEDIA;
  const FEATURED_MIX = djData
    ? mapFreeFeaturedMix(djData)
    : FREE_DEFAULT_FEATURED_MIX;
  const videoThumb = djData
    ? djData.spotlight.featuredVideo.thumbnail
    : "/gallery-2.png";
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
            <div className="flex-1 min-w-0 pt-1 sm:pb-2  z-10">
              <h1 className="font-heading text-3xl md:text-4xl text-white leading-none">
                Dj {DJ.stageName}
              </h1>
              <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-h_red" /> {location}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:pb-2">
              <Button className="bg-h_red hover:bg-h_redDark text-white font-semibold">
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
                aria-label="Share"
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
          <div className="grid grid-cols-3 py-5">
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
              },
              {
                val: DJ.eventsCount.toString(),
                label: "Events",
                icon: CalendarDays,
              },
            ].map((s, i) => {
              const SIcon = s.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col items-center",
                    i < 2 && "border-r border-white/10",
                  )}
                >
                  <span className="text-2xl font-bold text-white">{s.val}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <SIcon
                      className={cn("h-3 w-3", i === 1 && "text-amber-400")}
                    />
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
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            {/* ── SPOTLIGHT ── */}
            <section>
              <SectionHeading sub="Featured content curated by this DJ">
                Spotlight
              </SectionHeading>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Featured Mix */}
                <MediaAudioPlayer
                  audioUrl={FEATURED_MIX.audioUrl}
                  title={FEATURED_MIX.title}
                >
                  <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-h_red/30 transition-all gap-0 h-full flex flex-col">
                    <div className="relative h-40 bg-linear-to-br from-h_red/20 to-black shrink-0">
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
                        {FEATURED_MIX.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {FEATURED_MIX.duration} · {FEATURED_MIX.plays} plays
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {FEATURED_MIX.genres.map((t) => (
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
                </MediaAudioPlayer>

                {/* Featured Video */}
                <MediaVideoModal
                  videoUrl={djData?.spotlight.featuredVideo.videoUrl ?? ""}
                  thumbnail={videoThumb}
                  title={
                    djData?.spotlight.featuredVideo.title ??
                    "Live @ Berghain — Summer Closing 2024"
                  }
                >
                  <Card className="bg-h_blackLight/30 border-white/8 overflow-hidden group cursor-pointer hover:border-h_red/30 transition-all gap-0 h-full flex flex-col">
                    <div className="relative h-40 bg-linear-to-br from-slate-900 via-gray-900 to-black shrink-0">
                      <Image
                        src={videoThumb}
                        alt="video thumbnail"
                        fill
                        className="object-cover opacity-50 group-hover:opacity-60 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                          <Play className="h-5 w-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/60 text-gray-300 border-white/10 text-[10px]">
                          <Video className="h-2.5 w-2.5 mr-1" />
                          Featured Video
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-sm font-semibold">
                        {djData?.spotlight.featuredVideo.title ??
                          "Live @ Berghain — Summer Closing 2024"}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {djData?.spotlight.featuredVideo.duration ?? "45 min"} ·
                        {" "}
                        {djData?.spotlight.featuredVideo.subtitle ?? "YouTube"}
                      </p>
                      <div className="mt-2">
                        <Badge className="bg-white/5 text-gray-400 border-white/10 text-[10px] h-4">
                          Live Performance
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </MediaVideoModal>
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

            {/* ── MY SOUND ── */}
            <section>
              <SectionHeading sub="1 mix · Upgrade to share your full discography">
                My Sound
              </SectionHeading>
              <MediaAudioPlayer
                audioUrl={FEATURED_MIX.audioUrl}
                title={FEATURED_MIX.title}
              >
                <Card className="bg-h_blackLight/30 border-white/8 p-4 gap-0 cursor-pointer hover:border-white/15 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-lg bg-linear-to-br from-h_red/30 to-h_redDark/10 border border-white/8 flex items-center justify-center shrink-0">
                      <Music className="h-5 w-5 text-h_red" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">
                        {FEATURED_MIX.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {FEATURED_MIX.platform} · {FEATURED_MIX.duration} ·{" "}
                        {FEATURED_MIX.plays} plays
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
                    <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <Play className="h-3 w-3 ml-0.5" />
                    </div>
                  </div>
                </Card>
              </MediaAudioPlayer>
            </section>

            <Separator className="bg-white/8" />

            {/* ── MEDIA ── */}
            <section>
              <SectionHeading sub="Unlimited photos · 1 video on Free plan">
                Media
              </SectionHeading>
              <MediaGalleryLightbox photos={MEDIA} className="mb-3" />
            </section>

            <Separator className="bg-white/8" />

            <ProfileVenues venues={VENUES} />

            <Separator className="bg-white/8" />

            <ProfileReviews
              avgRating={DJ.avgRating}
              ratingCount={DJ.ratingCount}
              reviews={REVIEWS}
            />

            {/* ── LOCKED PREMIUM TEASERS (DJ owner only) ── */}
            {viewMode === "dj-owner" && (
              <>
                <Separator className="bg-white/8" />
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-heading text-xl text-white flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-400" />
                        Unlock Premium Features
                      </h2>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Upgrade to share more and grow your bookings
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs shrink-0"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(
                      [
                        {
                          title: "Performance Insights",
                          desc: "Analytics, profile views & booking stats",
                          icon: ChartLine,
                        },
                        {
                          title: "Availability Calendar",
                          desc: "Show your available & booked dates",
                          icon: CalendarDays,
                        },
                        {
                          title: "Booking Packages",
                          desc: "Offer tailored packages to clients",
                          icon: BriefcaseBusiness,
                        },
                        {
                          title: "Career Highlights",
                          desc: "Showcase your biggest achievements",
                          icon: Trophy,
                        },
                        {
                          title: "Industry Endorsements",
                          desc: "Display testimonials from venues & promoters",
                          icon: Star,
                        },
                        {
                          title: "Press & Media",
                          desc: "Link your features, interviews & podcasts",
                          icon: Newspaper,
                        },
                      ] as const
                    ).map((f) => {
                      const FIcon = f.icon;
                      return (
                        <div
                          key={f.title}
                          className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15"
                        >
                          <div className="size-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <FIcon className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">
                              {f.title}
                            </p>
                            <p className="text-gray-500 text-xs">{f.desc}</p>
                          </div>
                          <Lock className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
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
            </Card>

            <ProfileEventsSidebar events={EVENTS} />

            <Separator className="bg-white/8" />

            {/* Specializes In */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <Music className="h-3 w-3 text-h_red" />
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
