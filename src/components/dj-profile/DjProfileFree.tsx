"use client";

import Image from "next/image";
import Link from "next/link";
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
  Pencil,
  ImageIcon,
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
import { calculateProfileCompletion } from "@/lib/profile-completion";

function EmptySectionState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <Link href={actionHref}>
      <div className="group flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 px-4 py-8 text-center transition-colors hover:border-white/20">
        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-white/8">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="mt-1 text-xs text-gray-600">{description}</p>
        <span className="text-h_red mt-3 text-xs font-medium">
          {actionLabel} →
        </span>
      </div>
    </Link>
  );
}

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

  const isOwner = viewMode === "dj-owner";
  const editHref = djData?.slug ? `/djs/${djData.slug}/edit` : "#";
  const bookingEmail = djData
    ? djData.booking.email
    : FREE_DEFAULT_DJ.bookingEmail;
  const bookingPhone = djData
    ? djData.booking.phone
    : FREE_DEFAULT_DJ.bookingPhone;
  const bookingHref = bookingEmail
    ? `mailto:${bookingEmail}?subject=Booking%20Enquiry%20via%20DJscovery`
    : bookingPhone
      ? `tel:${bookingPhone}`
      : "#";

  const hasFeaturedMix = FEATURED_MIX.audioUrl !== "";
  const hasFeaturedVideo = !!djData?.spotlight.featuredVideo.videoUrl;
  const hasSpotlight = hasFeaturedMix || hasFeaturedVideo;
  const hasMixes = hasFeaturedMix;
  const hasPhotos = MEDIA.length > 0;
  const hasVenues = VENUES.length > 0;

  const completion = djData ? calculateProfileCompletion(djData) : null;

  return (
    <div className="min-h-screen bg-black">
      {/* ── HERO ── */}
      <section className="w-full">
        <div className="relative h-64 w-full overflow-hidden md:h-96">
          <Image
            src={DJ.coverImage}
            alt="cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
          <div className="from-h_red/8 absolute inset-0 bg-linear-to-r to-transparent" />
        </div>

        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="-mt-16 flex flex-col gap-4 pb-5 sm:-mt-14 sm:flex-row sm:items-end">
            <div className="relative z-10 shrink-0">
              <div className="ring-h_red h-28 w-28 overflow-hidden rounded-full ring-4 ring-offset-2 ring-offset-black sm:h-32 sm:w-32">
                <Image
                  src={DJ.avatar}
                  alt={DJ.stageName}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="z-10 min-w-0 flex-1 pt-1 sm:pb-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-white md:text-4xl">
                Dj {DJ.stageName}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-400">
                <MapPin className="text-h_red h-3 w-3" /> {location}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:pb-2">
              {isOwner && djData?.slug ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                  asChild
                >
                  <Link href={editHref}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    className="bg-h_red hover:bg-h_redDark font-semibold text-white"
                    asChild
                  >
                    <a href={bookingHref}>
                      <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
                      Book DJ
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 text-gray-300 hover:bg-white/5"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Follow
                  </Button>
                </>
              )}
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
                  <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
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
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Column */}
          <div className="flex flex-col gap-12 lg:col-span-2">
            {/* ── SPOTLIGHT ── */}
            {(hasSpotlight || isOwner) && (
              <section>
                <SectionHeading sub="Featured content curated by this DJ">
                  Spotlight
                </SectionHeading>
                {hasSpotlight ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Featured Mix */}
                    {hasFeaturedMix && (
                      <MediaAudioPlayer
                        audioUrl={FEATURED_MIX.audioUrl}
                        title={FEATURED_MIX.title}
                      >
                        <Card className="bg-h_blackLight/30 group hover:border-h_red/30 flex h-full cursor-pointer flex-col gap-0 overflow-hidden border-white/8 transition-all">
                          <div className="from-h_red/20 relative h-40 shrink-0 bg-linear-to-br to-black">
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
                              {FEATURED_MIX.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {FEATURED_MIX.duration} · {FEATURED_MIX.plays}{" "}
                              plays
                            </p>
                            <div className="mt-2 flex items-center gap-1">
                              {FEATURED_MIX.genres.map((t) => (
                                <Badge
                                  key={t}
                                  className="h-4 border-white/10 bg-white/5 text-[11px] text-gray-400"
                                >
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </MediaAudioPlayer>
                    )}

                    {/* Featured Video */}
                    {hasFeaturedVideo && (
                      <MediaVideoModal
                        videoUrl={
                          djData?.spotlight.featuredVideo.videoUrl ?? ""
                        }
                        thumbnail={videoThumb}
                        title={
                          djData?.spotlight.featuredVideo.title ??
                          "Live @ Berghain — Summer Closing 2024"
                        }
                      >
                        <Card className="bg-h_blackLight/30 group hover:border-h_red/30 flex h-full cursor-pointer flex-col gap-0 overflow-hidden border-white/8 transition-all">
                          <div className="relative h-40 shrink-0 bg-linear-to-br from-slate-900 via-gray-900 to-black">
                            <Image
                              src={videoThumb}
                              alt="video thumbnail"
                              fill
                              className="object-cover opacity-50 transition-opacity group-hover:opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/50 transition-colors group-hover:bg-black/70">
                                <Play className="ml-0.5 h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-3 left-3">
                              <Badge className="border-white/10 bg-black/60 text-[11px] text-gray-300">
                                <Video className="mr-1 h-2.5 w-2.5" />
                                Featured Video
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-semibold text-white">
                              {djData?.spotlight.featuredVideo.title ??
                                "Live @ Berghain — Summer Closing 2024"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {djData?.spotlight.featuredVideo.duration ??
                                "45 min"}{" "}
                              ·{" "}
                              {djData?.spotlight.featuredVideo.subtitle ??
                                "YouTube"}
                            </p>
                            <div className="mt-2">
                              <Badge className="h-4 border-white/10 bg-white/5 text-[11px] text-gray-400">
                                Live Performance
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </MediaVideoModal>
                    )}
                  </div>
                ) : (
                  <EmptySectionState
                    icon={Play}
                    title="No spotlight content yet"
                    description="Add a featured mix or video to showcase your sound"
                    actionLabel="Add Content"
                    actionHref={editHref}
                  />
                )}
              </section>
            )}

            {(hasSpotlight || isOwner) && <Separator className="bg-white/8" />}

            <ProfileAbout
              bio={DJ.bio}
              djTypes={DJ.djTypes}
              bioExpanded={bioExpanded}
              onToggleBio={() => setBioExpanded(!bioExpanded)}
            />

            <Separator className="bg-white/8" />

            {/* ── MY SOUND ── */}
            {(hasMixes || isOwner) && (
              <section>
                <SectionHeading sub="1 mix · Upgrade to share your full discography">
                  My Sound
                </SectionHeading>
                {hasMixes ? (
                  <MediaAudioPlayer
                    audioUrl={FEATURED_MIX.audioUrl}
                    title={FEATURED_MIX.title}
                  >
                    <Card className="bg-h_blackLight/30 cursor-pointer gap-0 border-white/8 p-4 transition-colors hover:border-white/15">
                      <div className="flex items-center gap-4">
                        <div className="from-h_red/30 to-h_redDark/10 flex size-14 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-linear-to-br">
                          <Music className="text-h_red h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">
                            {FEATURED_MIX.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {FEATURED_MIX.platform} · {FEATURED_MIX.duration} ·{" "}
                            {FEATURED_MIX.plays} plays
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                              <div className="bg-h_red h-full w-1/3 rounded-full" />
                            </div>
                            <span className="text-[11px] text-gray-600">
                              28:14 / 1:24:00
                            </span>
                          </div>
                        </div>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                          <Play className="ml-0.5 h-3 w-3" />
                        </div>
                      </div>
                    </Card>
                  </MediaAudioPlayer>
                ) : (
                  <EmptySectionState
                    icon={Music}
                    title="No mixes added yet"
                    description="Share your first mix or playlist link with your audience"
                    actionLabel="Add Mix"
                    actionHref={editHref}
                  />
                )}
              </section>
            )}

            {(hasMixes || isOwner) && <Separator className="bg-white/8" />}

            {/* ── MEDIA ── */}
            {(hasPhotos || isOwner) && (
              <section>
                <SectionHeading sub="Upgrade to unlock video uploads">
                  Media
                </SectionHeading>
                {hasPhotos ? (
                  <MediaGalleryLightbox photos={MEDIA} className="mb-3" />
                ) : (
                  <EmptySectionState
                    icon={ImageIcon}
                    title="No photos yet"
                    description="Add photos to show your vibe and past events"
                    actionLabel="Add Photos"
                    actionHref={editHref}
                  />
                )}
              </section>
            )}

            {(hasPhotos || isOwner) && <Separator className="bg-white/8" />}

            {hasVenues && <ProfileVenues venues={VENUES} />}

            {hasVenues && <Separator className="bg-white/8" />}

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
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="font-heading flex items-center gap-2 text-xl text-white">
                        <Crown className="h-4 w-4 text-amber-400" />
                        Unlock Premium Features
                      </h2>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Upgrade to share more and grow your bookings
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 bg-amber-500 text-xs font-semibold text-black hover:bg-amber-600"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
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
                          className="flex items-center gap-3 rounded-lg border border-amber-500/15 bg-amber-500/5 p-3"
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10">
                            <FIcon className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">
                              {f.title}
                            </p>
                            <p className="text-xs text-gray-500">{f.desc}</p>
                          </div>
                          <Lock className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-28 flex h-fit flex-col gap-5">
            {/* Book CTA */}
            <Card className="from-h_red/10 border-h_red/20 gap-0 bg-linear-to-b to-transparent p-5">
              <h3 className="mb-1 text-sm font-semibold text-white">
                Book {DJ.stageName}
              </h3>
              <p className="mb-4 text-xs text-gray-400">
                For clubs, festivals, events & more
              </p>
              <Button
                className="bg-h_red hover:bg-h_redDark mb-2 w-full font-semibold text-white"
                asChild
              >
                <a href={bookingHref}>
                  <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
                  Book / Hire DJ
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full border-white/15 text-gray-300 hover:bg-white/5"
                asChild
              >
                <a href={bookingHref}>
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Send Inquiry
                </a>
              </Button>
            </Card>

            <ProfileEventsSidebar events={EVENTS} isOwner={isOwner} />

            <Separator className="bg-white/8" />

            {/* Specializes In */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Music className="text-h_red h-3 w-3" />
                Specializes In
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {DJ.djTypes.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-white/15 text-xs text-gray-300"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-white/8" />

            {/* Profile completion prompt */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  Profile Strength
                </span>
                <span className="text-xs font-bold text-white">
                  {completion ? `${completion.percentage}%` : "68%"}
                </span>
              </div>
              <Progress
                value={completion?.percentage ?? 68}
                className="mb-2 h-1.5 bg-white/8"
              />
              <p className="text-xs text-gray-500">
                {completion?.suggestions[0] ??
                  "Add more photos & connect Spotify to reach 100%."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
