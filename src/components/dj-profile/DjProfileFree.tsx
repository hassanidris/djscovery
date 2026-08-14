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
  Zap,
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
import ProfileEventsSidebar from "@/components/dj-profile/ProfileEventsSidebar";
import DjProfileSubNav from "@/components/dj-profile/DjProfileSubNav";
import DjProfileMobileBottomBar from "@/components/dj-profile/DjProfileMobileBottomBar";
import DjEventsModule from "@/components/dj-profile/DjEventsModule";
import { ReputationBadge } from "@/components/dj-profile/ReputationBadge";
import { ScoreBreakdown } from "@/components/dj-profile/ScoreBreakdown";
import {
  SOCIAL_ICONS,
  SectionHeading,
  formatPlays,
  type ReviewItem,
} from "@/components/dj-profile/dj-profile-shared";
import {
  FREE_DEFAULT_DJ,
  FREE_DEFAULT_EVENTS,
  FREE_DEFAULT_REVIEWS,
  FREE_DEFAULT_MEDIA,
  FREE_DEFAULT_FEATURED_MIX,
} from "@/data/dj-profile-defaults";
import {
  mapFreeDjToProps,
  mapFreeEventsFromData,
  mapFreeReviewsFromData,
  mapFreeMediaFromData,
  mapFreeFeaturedMix,
  mapMixesFromData,
} from "@/lib/dj-profile-mappers";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { cn } from "@/lib/utils";
import { getVideoThumbnailUrl } from "@/lib/media-utils";
import { useAudioThumbnail } from "@/lib/media-thumbnails";
import { useBookingOptions } from "@/hooks/useBookingOptions";
import { useViewerContext } from "@/hooks/useViewerContext";
import { usePaginatedRatings } from "@/hooks/usePaginatedRatings";
import { useReviewTypeCounts } from "@/hooks/useReviewTypeCounts";
import { usePaginatedMedia } from "@/hooks/usePaginatedMedia";
import { useLazyData } from "@/hooks/useLazyData";
import { useDjAnalytics } from "@/hooks/useDjAnalytics";
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
  actionLabel?: string;
  actionHref?: string;
}) {
  const content = (
    <div className="group flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 px-4 py-8 text-center transition-colors hover:border-white/20">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-white/8">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
      {actionLabel && (
        <span className="text-h_redLight mt-3 text-xs font-medium">
          {actionLabel} →
        </span>
      )}
    </div>
  );

  if (actionHref) {
    return <Link href={actionHref}>{content}</Link>;
  }

  return content;
}

function MixPlayer({
  mix,
}: {
  mix: {
    id?: number;
    title: string;
    audioUrl: string;
    platform: string;
    duration: string;
    plays: string;
  };
}) {
  const thumb = useAudioThumbnail(mix.audioUrl);

  return (
    <MediaAudioPlayer
      audioUrl={mix.audioUrl}
      title={mix.title}
      thumbnailUrl={thumb || undefined}
      mediaId={mix.id}
    >
      <Card className="bg-h_blackLight/30 flex cursor-pointer flex-row items-center gap-0 border-white/8 p-4 transition-colors hover:border-white/15">
        <div className="from-h_red/30 to-h_redDark/10 mr-4 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/8 bg-linear-to-br">
          {thumb ? (
            <Image
              src={thumb}
              alt={mix.title}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <Music className="text-h_redLight h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{mix.title}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {mix.platform} · {mix.duration} · {mix.plays} plays
          </p>
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
          <Play className="ml-0.5 h-3 w-3" />
        </div>
      </Card>
    </MediaAudioPlayer>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DjProfileFree({
  djData,
  viewMode: viewModeProp = "fan",
  isFollowed: isFollowedProp = false,
  reputationScore,
  reputationDetail,
  viewerContext: viewerContextProp,
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
  const slug = djData?.slug || "";
  const [bioExpanded, setBioExpanded] = useState(false);
  const [mediaTab, setMediaTab] = useState<"photos" | "videos" | "mixes">(
    "photos",
  );
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  // Per-viewer state (follow status, booking role) is fetched client-side so
  // the parent page can stay a static, ISR-cached shell with no auth reads.
  const {
    viewMode: fetchedViewMode,
    isFollowed: fetchedIsFollowed,
    viewerContext: fetchedViewerContext,
  } = useViewerContext(slug || undefined);
  const viewMode = slug ? fetchedViewMode : viewModeProp;
  const isFollowed = slug ? fetchedIsFollowed : isFollowedProp;
  const viewerContext = slug ? fetchedViewerContext : viewerContextProp;

  // Fetch booking options client-side (same as Premium)
  const { options: clientBookingOptions } = useBookingOptions(
    viewerContext?.organizerCountryId ?? undefined,
    viewerContext?.organizerCityId ?? undefined,
    (djData as any)?.countryId
      ? parseInt((djData as any).countryId)
      : undefined,
    (djData as any)?.cityId ? parseInt((djData as any).cityId) : undefined,
  );

  const finalBookingOptions =
    clientBookingOptions.countries.length > 0
      ? clientBookingOptions
      : bookingOptions;

  // Track which review tab is active so we can fetch with the right filter
  const [ratingsFilter, setRatingsFilter] = useState<
    "all" | "direct" | "event" | "gig"
  >("all");

  // Map tab name to the filter expected by usePaginatedRatings
  const ratingsFilterParam =
    ratingsFilter === "direct"
      ? ("direct" as const)
      : ratingsFilter === "event"
        ? ("event" as const)
        : ratingsFilter === "gig"
          ? ("gig" as const)
          : undefined;

  // Fetch ratings client-side with pagination (same as Premium)
  const {
    ratings: fetchedRatings,
    totalCount: ratingsTotalCount,
    hasNextPage: ratingsHasNextPage,
    avgRating: fetchedAvgRating,
    isLoading: ratingsIsLoading,
    loadNextPage: loadMoreRatings,
  } = usePaginatedRatings(slug, ratingsFilterParam);

  // Fetch persistent review type counts (don't change with tab filter)
  const reviewTypeCounts = useReviewTypeCounts(slug);

  // Show the loading skeleton only while loading AND no ratings have been
  // loaded yet. usePaginatedRatings keeps previous data during tab switches,
  // so the skeleton won't flash when switching between populated tabs.
  const showRatingsSkeleton =
    ratingsIsLoading && fetchedRatings.length === 0 && ratingsTotalCount === 0;

  // Fetch media client-side with pagination (same as Premium)
  const {
    media: fetchedMedia,
    hasNextPage: mediaHasNextPage,
    isLoading: mediaIsLoading,
    loadNextPage: loadMoreMedia,
    typeCounts: mediaTypeCounts,
  } = usePaginatedMedia(slug);

  // Lazy-load spotlight when scrolled into view (same as Premium)
  const { data: lazySpotlight, hasLoaded: spotlightHasLoaded } =
    useLazyData<any>(slug, "spotlight", true);

  // Lazy-load mixes when scrolled into view
  const {
    data: lazyMixes,
    isLoading: mixesIsLoading,
    hasLoaded: mixesHasLoaded,
  } = useLazyData<any>(slug, "mixes", true);

  // Fetch analytics client-side (avgRating, eventsCount, responseRate, bookingRate)
  const { analytics } = useDjAnalytics(slug);

  // Lazy-load events when scrolled into view (same as Premium)
  const {
    data: lazyEvents,
    isLoading: eventsIsLoading,
    hasLoaded: eventsHasLoaded,
  } = useLazyData<any>(slug, "events", true);

  // Transform fetched ratings to reviews format
  const transformedReviews = fetchedRatings.map((r) => ({
    id: r.id,
    rating: r.rating,
    review: r.review || "",
    date: new Date(r.createdAt).toISOString().split("T")[0],
    user: {
      name: r.user.name || r.user.username,
      image: r.user.image || "",
      roles: r.user.roles ?? [],
    },
    reviewType: r.reviewType as ReviewItem["reviewType"],
    event: r.event
      ? {
          id: r.event.id,
          slug: r.event.slug,
          title: r.event.title,
          startDate: new Date(r.event.startDate).toISOString().split("T")[0],
        }
      : null,
    gig: r.gig
      ? {
          id: r.gig.id,
          slug: r.gig.slug,
          title: r.gig.title,
        }
      : null,
  }));

  // Transform fetched media: photos for gallery, videos for video tab
  const transformedMedia = fetchedMedia
    .filter((m) => m.type === "IMAGE")
    .map((m) => ({ id: m.id, url: m.url }));

  const videoMedia = fetchedMedia
    .filter((m) => m.type === "VIDEO")
    .map((m) => ({
      id: m.id,
      url: m.thumbnail || "/gallery-1.png",
      videoUrl: m.url,
      title: m.title || "",
      type: "video" as const,
      views: m.viewCount ?? 0,
    }));

  // In staging: use real data if available, supplement with demo data
  // In production: only use real data
  // Merge client-side analytics into djData for hero stats
  // Note: responseRate & bookingRate are premium-only — not merged for free plans
  const djDataWithAnalytics =
    djData && analytics
      ? {
          ...djData,
          stats: {
            ...djData.stats,
            rating: analytics.avgRating || djData.stats.rating,
            events: analytics.publicEventsCount || djData.stats.events,
          },
        }
      : djData;

  const DJ = djDataWithAnalytics
    ? mapFreeDjToProps(djDataWithAnalytics)
    : isStaging
      ? FREE_DEFAULT_DJ
      : null;
  const EVENTS =
    eventsHasLoaded && lazyEvents
      ? lazyEvents
      : djData
        ? mapFreeEventsFromData(djData)
        : isStaging
          ? FREE_DEFAULT_EVENTS
          : [];
  const REVIEWS = djData
    ? transformedReviews.length > 0
      ? transformedReviews
      : mapFreeReviewsFromData(djData)
    : isStaging
      ? FREE_DEFAULT_REVIEWS
      : [];
  const MEDIA = djData
    ? transformedMedia.length > 0
      ? transformedMedia
      : mapFreeMediaFromData(djData)
    : isStaging
      ? FREE_DEFAULT_MEDIA
      : [];
  const FEATURED_MIX = djData
    ? mapFreeFeaturedMix(djData)
    : isStaging
      ? FREE_DEFAULT_FEATURED_MIX
      : null;

  // Compute spotlight from lazy-loaded data or fall back to server data
  const SPOTLIGHT =
    spotlightHasLoaded && lazySpotlight
      ? lazySpotlight
      : djData
        ? {
            featuredMix: djData.spotlight?.featuredMix
              ? {
                  ...djData.spotlight.featuredMix,
                  audioUrl:
                    (djData.spotlight.featuredMix as any).audioUrl ||
                    (djData.spotlight.featuredMix as any).url,
                  plays:
                    (djData.spotlight.featuredMix as any).plays ||
                    (djData.spotlight.featuredMix as any).playCount,
                }
              : null,
            featuredVideo: djData.spotlight?.featuredVideo
              ? {
                  ...djData.spotlight.featuredVideo,
                  videoUrl:
                    (djData.spotlight.featuredVideo as any).videoUrl ||
                    (djData.spotlight.featuredVideo as any).url,
                  views:
                    (djData.spotlight.featuredVideo as any).views ||
                    (djData.spotlight.featuredVideo as any).viewCount,
                }
              : null,
          }
        : null;

  // Mixes for the mixes tab (lazy-loaded, falls back to djData)
  const MIXES =
    mixesHasLoaded && lazyMixes
      ? lazyMixes
      : djData
        ? mapMixesFromData(djData)
        : [];
  const effectiveFeaturedMix =
    spotlightHasLoaded && SPOTLIGHT?.featuredMix
      ? {
          ...FEATURED_MIX,
          audioUrl:
            SPOTLIGHT.featuredMix.audioUrl || FEATURED_MIX?.audioUrl || "",
          title: SPOTLIGHT.featuredMix.title || FEATURED_MIX?.title || "",
          thumbnail: SPOTLIGHT.featuredMix.thumbnail || FEATURED_MIX?.thumbnail,
          duration:
            SPOTLIGHT.featuredMix.duration || FEATURED_MIX?.duration || "",
          plays: SPOTLIGHT.featuredMix.plays ?? FEATURED_MIX?.plays ?? "0",
        }
      : FEATURED_MIX;

  const videoUrl = SPOTLIGHT?.featuredVideo?.videoUrl ?? "";
  const videoThumb =
    SPOTLIGHT?.featuredVideo?.thumbnail ||
    getVideoThumbnailUrl(videoUrl) ||
    "/gallery-2.png";
  const location = DJ ? `${DJ.city}, ${DJ.country}` : "";

  const featuredMixAudioUrl = effectiveFeaturedMix?.audioUrl ?? "";
  // Hooks must run unconditionally before any early return (Rules of Hooks)
  const autoMixThumb = useAudioThumbnail(featuredMixAudioUrl);
  const featuredMixThumb =
    effectiveFeaturedMix?.thumbnail || autoMixThumb || "/gallery-2.png";

  // Early return in production if no data available
  if (!DJ && isProduction) {
    return null;
  }

  // After this point, DJ and effectiveFeaturedMix are guaranteed to be non-null
  // (either from real data or demo defaults in staging)
  const safeDJ = DJ!;
  const safeFEATURED_MIX = effectiveFeaturedMix!;

  const isOwner = viewMode === "dj-owner";
  const editHref = "/dj/settings";
  const bookingContext: BookingViewerContext = viewerContext ?? {
    role: "guest",
    isAuthenticated: false,
  };

  const hasFeaturedMix = safeFEATURED_MIX.audioUrl !== "";
  const hasFeaturedVideo = !!SPOTLIGHT?.featuredVideo?.videoUrl;
  const hasSpotlight = hasFeaturedMix || hasFeaturedVideo;
  const hasMixes = hasFeaturedMix;
  const hasPhotos = MEDIA.length > 0;
  const hasVideos = videoMedia.length > 0;
  const hasMixesTab = MIXES.filter((m: any) => m.audioUrl).length > 0;

  // Use client-fetched media for accurate completion check (server only has spotlight photos)
  const djDataForCompletion =
    djData && transformedMedia.length > 0
      ? {
          ...djData,
          media: {
            ...djData.media,
            photos: transformedMedia.map((m) => m.url),
          },
        }
      : djData;

  const completion = djDataForCompletion
    ? calculateProfileCompletion(djDataForCompletion)
    : null;

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
        djData={djDataWithAnalytics ?? djData}
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
            {/* ── STICKY SUB-NAVIGATION ── */}
            <div className="bg-h_blackLight/30 sticky top-[4.125rem] z-40 rounded-lg border border-white/8 px-4 py-2 shadow-md shadow-black/20 backdrop-blur-sm">
              <DjProfileSubNav showPremiumTabs={false} />
            </div>
            {/* ── MOBILE BOOK CTA ── */}
            <BookCTA
              stageName={`Dj. ${safeDJ.stageName}`}
              djProfileId={djProfileId}
              viewer={bookingContext}
              variant="free"
              layout="mobile"
              bookingOptions={finalBookingOptions}
            />

            <div id="about">
              <ProfileAbout
                bio={safeDJ.bio}
                djTypes={safeDJ.djTypes}
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
            </div>

            <Separator className="bg-white/8" />

            {/* ── EVENTS MODULE ── */}
            <div id="events">
              <DjEventsModule
                events={EVENTS}
                calendarDays={[]}
                calendarLabel="Calendar"
                isOwner={isOwner}
                djName={safeDJ.stageName}
                featuredPerformanceUrl={djData?.featuredPerformanceUrl}
                featuredPerformanceContext={djData?.featuredPerformanceContext}
                featuredPerformanceThumbnailUrl={
                  djData?.featuredPerformanceThumbnailUrl
                }
                showCalendar={false}
              />
            </div>

            <Separator className="bg-white/8" />

            {/* ── MEDIA ── */}
            {(hasPhotos ||
              hasVideos ||
              hasMixesTab ||
              hasSpotlight ||
              isOwner) && (
              <section id="media">
                <SectionHeading sub="2 video/audio uploads included in free plan">
                  Media
                </SectionHeading>

                {/* ── SPOTLIGHT (nested inside Media) ── */}
                {hasSpotlight && (
                  <>
                    <h3 className="mb-4 text-sm font-semibold text-gray-400">
                      Spotlight
                    </h3>
                    <div className="mb-8 grid gap-4 sm:grid-cols-2">
                      {/* Featured Mix */}
                      {hasFeaturedMix && (
                        <MediaAudioPlayer
                          audioUrl={safeFEATURED_MIX.audioUrl}
                          title={safeFEATURED_MIX.title}
                          thumbnailUrl={featuredMixThumb || undefined}
                          mediaId={safeFEATURED_MIX.id}
                        >
                          <Card className="bg-h_blackLight/30 group hover:border-h_red/30 flex h-full cursor-pointer flex-col gap-0 overflow-hidden border-white/8 transition-all">
                            <div className="from-h_red/20 relative h-40 shrink-0 bg-linear-to-br to-black">
                              {featuredMixThumb ? (
                                <Image
                                  src={featuredMixThumb}
                                  alt={safeFEATURED_MIX.title}
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
                                {safeFEATURED_MIX.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {safeFEATURED_MIX.duration} ·{" "}
                                {safeFEATURED_MIX.plays} plays
                              </p>
                              <div className="mt-2 flex items-center gap-1">
                                {(safeFEATURED_MIX.genres ?? []).map((t) => (
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
                          videoUrl={videoUrl}
                          thumbnail={videoThumb}
                          title={
                            SPOTLIGHT?.featuredVideo?.title ??
                            "Live @ Berghain — Summer Closing 2024"
                          }
                          mediaId={SPOTLIGHT?.featuredVideo?.id}
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
                                {SPOTLIGHT?.featuredVideo?.title ??
                                  "Live @ Berghain — Summer Closing 2024"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {SPOTLIGHT?.featuredVideo?.duration ?? "45 min"}{" "}
                                · {SPOTLIGHT?.featuredVideo?.views ?? 0} views
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
                  </>
                )}

                {/* ── MEDIA TABS ── */}
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
                  <>
                    {mediaIsLoading && MEDIA.length === 0 ? (
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="h-32 animate-pulse rounded-lg bg-white/5"
                          />
                        ))}
                      </div>
                    ) : MEDIA.length > 0 ? (
                      <>
                        <MediaGalleryLightbox photos={MEDIA} className="mb-3" />
                        {mediaHasNextPage && (
                          <div className="flex justify-center pt-4">
                            <Button
                              onClick={loadMoreMedia}
                              disabled={mediaIsLoading}
                              variant="outline"
                              className="border-white/10 bg-white/5 hover:bg-white/10"
                            >
                              {mediaIsLoading
                                ? "Loading..."
                                : "Load More Photos"}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <EmptySectionState
                        icon={ImageIcon}
                        title="No photos yet"
                        description="Add photos to show your vibe and past events"
                        actionLabel="Add Photos"
                        actionHref={editHref}
                      />
                    )}
                  </>
                )}

                {mediaTab === "videos" && (
                  <>
                    {mediaIsLoading && videoMedia.length === 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="aspect-video animate-pulse rounded-lg bg-white/5"
                          />
                        ))}
                      </div>
                    ) : videoMedia.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {videoMedia.map((m) => (
                          <MediaVideoModal
                            key={m.id}
                            videoUrl={m.videoUrl}
                            thumbnail={
                              getVideoThumbnailUrl(m.videoUrl) || m.url
                            }
                            title={m.title || "Video"}
                            mediaId={m.id}
                          >
                            <div className="hover:ring-h_red/40 group relative aspect-video cursor-pointer overflow-hidden rounded-lg ring-1 ring-white/5 transition-all">
                              <Image
                                src={getVideoThumbnailUrl(m.videoUrl) || m.url}
                                alt="video"
                                fill
                                className="object-cover opacity-60 transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/50 transition-colors group-hover:bg-black/70">
                                  <Play className="ml-0.5 h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-gray-300">
                                {formatPlays(m.views ?? 0)} views
                              </div>
                            </div>
                          </MediaVideoModal>
                        ))}
                      </div>
                    ) : (
                      <EmptySectionState
                        icon={Video}
                        title="No videos yet"
                        description="Free plan includes up to 2 video uploads"
                        actionLabel="Add Video"
                        actionHref={editHref}
                      />
                    )}
                  </>
                )}

                {mediaTab === "mixes" && (
                  <div className="flex flex-col gap-3">
                    {hasMixesTab ? (
                      MIXES.filter((m: any) => m.audioUrl).map(
                        (mix: any, i: number) => (
                          <MixPlayer key={mix.id || mix.title || i} mix={mix} />
                        ),
                      )
                    ) : (
                      <EmptySectionState
                        icon={Music}
                        title="No mixes yet"
                        description="Free plan includes up to 2 audio uploads"
                        actionLabel="Add Mix"
                        actionHref={editHref}
                      />
                    )}
                  </div>
                )}
              </section>
            )}

            {(hasPhotos || hasVideos || hasMixesTab || isOwner) && (
              <Separator className="bg-white/8" />
            )}

            <section id="reviews">
              <SectionHeading sub="What people say about this DJ">
                Reviews
              </SectionHeading>
              {showRatingsSkeleton ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-4 rounded-lg bg-white/5 p-4"
                    >
                      <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : REVIEWS.length > 0 ? (
                <>
                  <ProfileReviews
                    avgRating={fetchedAvgRating || safeDJ.avgRating}
                    ratingCount={ratingsTotalCount || safeDJ.ratingCount}
                    reviews={REVIEWS}
                    djProfileId={djProfileId}
                    djName={safeDJ.stageName}
                    djAvatar={safeDJ.avatar}
                    djSlug={slug}
                    isOwner={isOwner}
                    hasNextPage={ratingsHasNextPage}
                    isLoadingMore={ratingsIsLoading}
                    onLoadMore={loadMoreRatings}
                    onTabChange={(tab) => setRatingsFilter(tab)}
                    totalDirectCount={reviewTypeCounts.direct}
                    totalEventCount={reviewTypeCounts.event}
                    totalGigCount={reviewTypeCounts.gig}
                  />
                </>
              ) : (
                <EmptySectionState
                  icon={Star}
                  title="No reviews yet"
                  description="Reviews build trust and help you get more bookings"
                  actionLabel={isOwner ? "Request Reviews" : undefined}
                  actionHref={isOwner ? editHref : undefined}
                />
              )}
            </section>

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
                    <p className="mt-0.5 text-xs text-gray-400">
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
                        title: "Advanced Analytics",
                        desc: "30-day trends, charts & demographic insights",
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
                        title: "Where I've Played",
                        desc: "Interactive map of your past venues & locations",
                        icon: MapPin,
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
                          <p className="text-xs text-gray-400">{f.desc}</p>
                        </div>
                        <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              </section>
            </OwnerOnlySection>
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-[4.125rem] hidden h-fit flex-col gap-5 lg:flex">
            {/* Book CTA — desktop only; mobile version is inline above */}
            <BookCTA
              stageName={`Dj. ${safeDJ.stageName}`}
              djProfileId={djProfileId}
              viewer={bookingContext}
              variant="free"
              layout="desktop"
              bookingOptions={finalBookingOptions}
            />

            {/* Trust & Social Proof Strip */}
            <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Response Rate
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Typically replies within 24h
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">Fast</p>
                </div>
              </div>
            </Card>

            {/* Events — desktop only; mobile version is inline above */}
            <div className="hidden lg:block">
              <ProfileEventsSidebar
                events={EVENTS}
                isOwner={isOwner}
                djName={safeDJ.stageName}
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
                  <p className="text-xs text-gray-400">
                    {completion?.suggestions[0] ??
                      "Add more photos & connect Spotify to reach 100%."}
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <DjProfileMobileBottomBar
        feeMin={djData?.booking?.feeRange?.min}
        feeMax={djData?.booking?.feeRange?.max}
        feeCurrency={djData?.booking?.feeRange?.currency}
        onBookClick={() => {}}
        isOwner={isOwner}
      />
    </div>
  );
}
