"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Play,
  Music,
  Video,
  Headphones,
  Star,
  Crown,
  Lock,
  ChartLine,
  Trophy,
  Newspaper,
  BriefcaseBusiness,
  Pencil,
  ImageIcon,
  MapPin,
} from "lucide-react";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import { DjProfileHero } from "@/components/dj-profile/DjProfileHero";
import { BookCTA } from "@/components/dj-profile/BookCTA";
import { OwnerOnlySection } from "@/components/dj-profile/OwnerOnlySection";
import MediaAudioPlayer from "@/components/dj-profile/MediaAudioPlayer";
import MediaVideoModal from "@/components/dj-profile/MediaVideoModal";
import MediaGalleryLightbox from "@/components/dj-profile/MediaGalleryLightbox";
import ProfileAbout from "@/components/dj-profile/ProfileAbout";
import ProfileReviews from "@/components/dj-profile/ProfileReviews";
import WhereIvePlayed from "@/components/dj-profile/WhereIvePlayed";
import ProfileEventsSidebar from "@/components/dj-profile/ProfileEventsSidebar";
import { ReputationBadge } from "@/components/dj-profile/ReputationBadge";
import { ScoreBreakdown } from "@/components/dj-profile/ScoreBreakdown";
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
import {
  getVideoThumbnailUrl,
  useAudioThumbnail,
} from "@/lib/media-thumbnails";
import type { BookingFormOptions, BookingViewerContext } from "@/types/booking";

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
  isFollowed = false,
  reputationScore,
  reputationDetail,
  viewerContext,
  bookingOptions,
}: {
  djData?: DjDemoData;
  viewMode?: ViewMode;
  isFollowed?: boolean;
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
  viewerContext?: BookingViewerContext;
  bookingOptions?: BookingFormOptions;
} = {}) {
  const djProfileId = djData ? parseInt(djData.id) : NaN;
  const [bioExpanded, setBioExpanded] = useState(false);

  const DJ = djData ? mapFreeDjToProps(djData) : FREE_DEFAULT_DJ;
  const EVENTS = djData ? mapFreeEventsFromData(djData) : FREE_DEFAULT_EVENTS;
  const VENUES = djData ? mapFreeVenuesFromData(djData) : [];
  const REVIEWS = djData ? mapFreeReviewsFromData(djData) : [];
  const MEDIA = djData ? mapFreeMediaFromData(djData) : FREE_DEFAULT_MEDIA;
  const FEATURED_MIX = djData
    ? mapFreeFeaturedMix(djData)
    : FREE_DEFAULT_FEATURED_MIX;
  const videoUrl = djData?.spotlight.featuredVideo.videoUrl ?? "";
  const videoThumb =
    djData?.spotlight.featuredVideo.thumbnail ||
    getVideoThumbnailUrl(videoUrl) ||
    "/gallery-2.png";
  const location = `${DJ.city}, ${DJ.country}`;

  const isOwner = viewMode === "dj-owner";
  const editHref = djData?.slug ? `/djs/${djData.slug}/edit` : "#";
  const bookingContext: BookingViewerContext = viewerContext ?? {
    role: "guest",
    isAuthenticated: false,
  };

  const hasFeaturedMix = FEATURED_MIX.audioUrl !== "";
  const hasFeaturedVideo = !!djData?.spotlight.featuredVideo.videoUrl;
  const hasSpotlight = hasFeaturedMix || hasFeaturedVideo;
  const hasMixes = hasFeaturedMix;
  const hasPhotos = MEDIA.length > 0;
  const hasVenues = VENUES.length > 0;

  const featuredMixAudioUrl = FEATURED_MIX.audioUrl;
  const featuredMixThumb = useAudioThumbnail(featuredMixAudioUrl);

  const completion = djData ? calculateProfileCompletion(djData) : null;

  if (!djData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ── HERO ── */}
      <DjProfileHero
        djData={djData}
        viewMode={viewMode}
        isFollowed={isFollowed}
        reputationScore={reputationScore}
        reputationDetail={reputationDetail}
        variant="free"
      />

      {/* ── PAGE BODY ── */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Column */}
          <div className="flex flex-col gap-12 lg:col-span-2">
            {/* ── MOBILE BOOK CTA ── */}
            <BookCTA
              stageName={`Dj. ${DJ.stageName}`}
              djProfileId={djProfileId}
              viewer={bookingContext}
              variant="free"
              layout="mobile"
              bookingOptions={bookingOptions}
            />

            <ProfileAbout
              bio={DJ.bio}
              djTypes={DJ.djTypes}
              bioExpanded={bioExpanded}
              onToggleBio={() => setBioExpanded(!bioExpanded)}
              experienceYears={djData?.experienceYears}
              experienceLevel={djData?.experienceLevel}
              feeMin={djData?.booking?.feeRange?.min}
              feeMax={djData?.booking?.feeRange?.max}
              feeCurrency={djData?.booking?.feeRange?.currency}
              bookingEmail={djData?.booking?.email}
              bookingPhone={djData?.booking?.phone}
              isOwner={isOwner}
            />

            <Separator className="bg-white/8" />

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
                        thumbnailUrl={featuredMixThumb || undefined}
                      >
                        <Card className="bg-h_blackLight/30 group hover:border-h_red/30 flex h-full cursor-pointer flex-col gap-0 overflow-hidden border-white/8 transition-all">
                          <div className="from-h_red/20 relative h-40 shrink-0 bg-linear-to-br to-black">
                            {featuredMixThumb ? (
                              <Image
                                src={featuredMixThumb}
                                alt={FEATURED_MIX.title}
                                fill
                                className="object-cover opacity-50 transition-opacity group-hover:opacity-60"
                              />
                            ) : null}
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
                    thumbnailUrl={featuredMixThumb || undefined}
                  >
                    <Card className="bg-h_blackLight/30 cursor-pointer gap-0 border-white/8 p-4 transition-colors hover:border-white/15">
                      <div className="flex items-center gap-4">
                        <div className="from-h_red/30 to-h_redDark/10 relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/8 bg-linear-to-br">
                          {featuredMixThumb ? (
                            <Image
                              src={featuredMixThumb}
                              alt={FEATURED_MIX.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Music className="text-h_red h-5 w-5" />
                          )}
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

            {/* ── MOBILE EVENTS ── */}
            <div className="lg:hidden">
              <ProfileEventsSidebar
                events={EVENTS}
                isOwner={isOwner}
                djName={DJ.stageName}
              />
            </div>

            <div className="lg:hidden">
              <Separator className="bg-white/8" />
            </div>

            {(REVIEWS.length > 0 || isOwner) && (
              <section>
                <SectionHeading sub="What people say about this DJ">
                  Reviews
                </SectionHeading>
                {REVIEWS.length > 0 ? (
                  <ProfileReviews
                    avgRating={DJ.avgRating}
                    ratingCount={DJ.ratingCount}
                    reviews={REVIEWS}
                  />
                ) : (
                  <EmptySectionState
                    icon={Star}
                    title="No reviews yet"
                    description="Reviews build trust and help you get more bookings"
                    actionLabel="Request Reviews"
                    actionHref={editHref}
                  />
                )}
              </section>
            )}

            {/* ── LOCKED PREMIUM TEASERS (DJ owner only) ── */}
            <OwnerOnlySection viewMode={viewMode}>
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
                    asChild
                    size="sm"
                    className="shrink-0 bg-amber-500 text-xs font-semibold text-black hover:bg-amber-600"
                  >
                    <Link href="/djs/compare">Upgrade Now</Link>
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
            </OwnerOnlySection>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-28 flex h-fit flex-col gap-5">
            {/* Book CTA — desktop only; mobile version is inline above */}
            <BookCTA
              stageName={`Dj. ${DJ.stageName}`}
              djProfileId={djProfileId}
              viewer={bookingContext}
              variant="free"
              layout="desktop"
              bookingOptions={bookingOptions}
            />

            {/* Events — desktop only; mobile version is inline above */}
            <div className="hidden lg:block">
              <ProfileEventsSidebar
                events={EVENTS}
                isOwner={isOwner}
                djName={DJ.stageName}
              />
            </div>

            {isOwner && (
              <>
                <Separator className="bg-white/8" />

                {/* Profile completion prompt (owner only) */}
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
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
