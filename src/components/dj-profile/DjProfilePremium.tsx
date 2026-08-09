"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Play,
  Music,
  Video,
  CircleCheck,
  ChartLine,
  Headphones,
  Landmark,
  BriefcaseBusiness,
  MapPin,
  Star,
  Plus,
  Pencil,
  Newspaper,
  Zap,
} from "lucide-react";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import { DjProfileHero } from "@/components/dj-profile/DjProfileHero";
import { BookCTA, type BookCTARef } from "@/components/dj-profile/BookCTA";
import { OwnerOnlySection } from "@/components/dj-profile/OwnerOnlySection";
import MediaAudioPlayer from "@/components/dj-profile/MediaAudioPlayer";
import MediaVideoModal from "@/components/dj-profile/MediaVideoModal";
import MediaGalleryLightbox from "@/components/dj-profile/MediaGalleryLightbox";
import ProfileAbout from "@/components/dj-profile/ProfileAbout";
import ProfileReviews from "@/components/dj-profile/ProfileReviews";
import WhereIvePlayed from "@/components/dj-profile/WhereIvePlayed";
import CareerHighlights from "@/components/dj-profile/CareerHighlights";
import DjProfileSubNav from "@/components/dj-profile/DjProfileSubNav";
import DjProfileMobileBottomBar from "@/components/dj-profile/DjProfileMobileBottomBar";
import VenueModal from "@/components/dj-profile/VenueModal";
import HighlightModal from "@/components/dj-profile/HighlightModal";
import PressModal from "@/components/dj-profile/PressModal";
import { HIGHLIGHT_ICONS, PRESS_ICON_MAP } from "@/data/dj-profile-defaults";
import BookingPackages from "@/components/dj-profile/BookingPackages";
import PackageModal from "@/components/dj-profile/PackageModal";
import ProfileEventsSidebar from "@/components/dj-profile/ProfileEventsSidebar";
import DjEventsModule from "@/components/dj-profile/DjEventsModule";
import ProfessionalTeamSidebar from "@/components/dj-profile/ProfessionalTeamSidebar";
import { addVenue, updateVenue, deleteVenue } from "@/lib/actions/profile";
import { useBookingOptions } from "@/hooks/useBookingOptions";
import { useViewerContext } from "@/hooks/useViewerContext";
import {
  getDjPackages,
  createDjPackage,
  updateDjPackage,
  deleteDjPackage,
} from "@/lib/actions/dj-packages";
import {
  getDjHighlights,
  createDjHighlight,
  updateDjHighlight,
  deleteDjHighlight,
} from "@/lib/actions/dj-highlights";
import {
  createDjPressItem,
  updateDjPressItem,
  deleteDjPressItem,
} from "@/lib/actions/dj-press";
import { toast } from "sonner";
import { ReputationBadge } from "@/components/dj-profile/ReputationBadge";
import { ScoreBreakdown } from "@/components/dj-profile/ScoreBreakdown";
import {
  SOCIAL_ICONS,
  Stars,
  SectionHeading,
  formatPlays,
  type ReviewItem,
} from "@/components/dj-profile/dj-profile-shared";
import {
  PREMIUM_DEFAULT_DJ,
  PREMIUM_DEFAULT_EVENTS,
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
import { usePaginatedMedia } from "@/hooks/usePaginatedMedia";
import { usePaginatedRatings } from "@/hooks/usePaginatedRatings";
import { useLazyVenues } from "@/hooks/useLazyVenues";
import { useLazyData } from "@/hooks/useLazyData";
import {
  mapPremiumDjToProps,
  mapPremiumEventsFromData,
  mapPremiumReviewsFromData,
  mapPremiumMediaFromData,
  mapEndorsementsFromData,
  mapHighlightsFromData,
  mapPressFromData,
  mapPackagesFromData,
  mapMixesFromData,
  getCalendarMonthLabel,
  buildCalendarFromData,
} from "@/lib/dj-profile-mappers";
import { getVideoThumbnailUrl } from "@/lib/media-utils";
import { useAudioThumbnail } from "@/lib/media-thumbnails";
import type { BookingFormOptions, BookingViewerContext } from "@/types/booking";

function EmptySectionState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/2 py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-gray-400">{description}</p>
      {actionHref ? (
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mt-4 text-xs text-gray-400 hover:text-white"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : onAction ? (
        <Button
          onClick={onAction}
          variant="ghost"
          size="sm"
          className="mt-4 text-xs text-gray-400 hover:text-white"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

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
      <span className="mt-1 text-center text-xs text-gray-400">{label}</span>
    </div>
  );
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

export default function DjProfilePremium({
  djData,
  viewMode: viewModeProp = "fan",
  isFollowed: isFollowedProp = false,
  reputationScore,
  reputationDetail,
  status,
  viewerContext: viewerContextProp,
  bookingOptions,
  countries,
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
  status?: string;
  viewerContext?: BookingViewerContext;
  bookingOptions?: BookingFormOptions;
  countries?: Array<{ id: number; name: string }>;
} = {}) {
  const djProfileId = djData ? parseInt(djData.id) : NaN;
  const [bioExpanded, setBioExpanded] = useState(false);
  const [mediaTab, setMediaTab] = useState<"photos" | "videos" | "mixes">(
    "photos",
  );
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isPressModalOpen, setIsPressModalOpen] = useState(false);
  const [pressItems, setPressItems] = useState<
    Array<{
      id: number;
      source: string;
      type: string;
      title: string;
      date: string;
      url: string;
    }>
  >(
    (djData?.press || []).map((p: any) => ({
      id: p.id || 0,
      source: p.source || "",
      type: p.type || "Feature",
      title: p.title || "",
      date: p.date || "",
      url: p.url || "",
    })),
  );
  const bookCTARefMobile = useRef<BookCTARef>(null);
  const bookCTARefDesktop = useRef<BookCTARef>(null);

  // Fetch media and ratings client-side with pagination
  const slug = djData?.slug || "";

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

  const {
    media: fetchedMedia,
    totalCount: mediaTotalCount,
    hasNextPage: mediaHasNextPage,
    isLoading: mediaIsLoading,
    loadNextPage: loadMoreMedia,
    typeCounts: mediaTypeCounts,
  } = usePaginatedMedia(slug);

  // Fetch booking options client-side
  const { options: clientBookingOptions, isLoading: bookingOptionsLoading } =
    useBookingOptions(
      viewerContext?.organizerCountryId ?? undefined,
      viewerContext?.organizerCityId ?? undefined,
      (djData as any)?.countryId
        ? parseInt((djData as any).countryId)
        : undefined,
      (djData as any)?.cityId ? parseInt((djData as any).cityId) : undefined,
    );

  // Use client-fetched options if available, otherwise use server options (empty array)
  const finalBookingOptions =
    clientBookingOptions.countries.length > 0
      ? clientBookingOptions
      : bookingOptions;

  // Track which review tab is active so we can fetch with the right filter
  const [ratingsFilter, setRatingsFilter] = useState<
    "all" | "direct" | "event"
  >("all");

  // Map tab name to the filter expected by usePaginatedRatings
  const ratingsFilterParam =
    ratingsFilter === "direct"
      ? ("direct" as const)
      : ratingsFilter === "event"
        ? ("event" as const)
        : undefined;

  const {
    ratings: fetchedRatings,
    totalCount: ratingsTotalCount,
    hasNextPage: ratingsHasNextPage,
    avgRating: fetchedAvgRating,
    isLoading: ratingsIsLoading,
    loadNextPage: loadMoreRatings,
  } = usePaginatedRatings(slug, ratingsFilterParam);

  // Lazy-load venues when scrolled into view
  const {
    venues: lazyVenues,
    isLoading: venuesIsLoading,
    hasLoaded: venuesHasLoaded,
    targetRef: venuesTargetRef,
  } = useLazyVenues(slug);

  // Lazy-load endorsements when scrolled into view
  const {
    data: lazyEndorsements,
    isLoading: endorsementsIsLoading,
    hasLoaded: endorsementsHasLoaded,
    targetRef: endorsementsTargetRef,
  } = useLazyData<any>(slug, "endorsements", true);

  // Lazy-load press when scrolled into view
  const {
    data: lazyPress,
    isLoading: pressIsLoading,
    hasLoaded: pressHasLoaded,
    targetRef: pressTargetRef,
  } = useLazyData<any>(slug, "press", true);

  // Lazy-load packages when scrolled into view
  const {
    data: lazyPackages,
    isLoading: packagesIsLoading,
    hasLoaded: packagesHasLoaded,
    targetRef: packagesTargetRef,
  } = useLazyData<any>(slug, "packages", true);

  // Lazy-load events when scrolled into view
  const {
    data: lazyEvents,
    isLoading: eventsIsLoading,
    hasLoaded: eventsHasLoaded,
  } = useLazyData<any>(slug, "events", true);

  // Lazy-load highlights when scrolled into view
  const {
    data: lazyHighlights,
    isLoading: highlightsIsLoading,
    hasLoaded: highlightsHasLoaded,
  } = useLazyData<any>(slug, "highlights", true);

  // Lazy-load calendar when scrolled into view
  const {
    data: lazyCalendar,
    isLoading: calendarIsLoading,
    hasLoaded: calendarHasLoaded,
  } = useLazyData<any>(slug, "calendar", true);

  // Lazy-load mixes when scrolled into view
  const {
    data: lazyMixes,
    isLoading: mixesIsLoading,
    hasLoaded: mixesHasLoaded,
  } = useLazyData<any>(slug, "mixes", true);

  // Lazy-load spotlight when scrolled into view
  const {
    data: lazySpotlight,
    isLoading: spotlightIsLoading,
    hasLoaded: spotlightHasLoaded,
  } = useLazyData<any>(slug, "spotlight", true);

  // Transform fetched media to PremiumMediaItem format (exclude AUDIO - handled in MIXES)
  const filteredMedia = fetchedMedia.filter((m) => m.type !== "AUDIO");
  const totalNonAudioCount =
    (mediaTypeCounts?.IMAGE || 0) + (mediaTypeCounts?.VIDEO || 0);
  const transformedMedia: PremiumMediaItem[] = filteredMedia.map((m) => {
    if (m.type === "IMAGE") {
      return {
        id: m.id,
        url: m.url,
        type: "photo" as const,
      };
    }
    if (m.type === "VIDEO") {
      return {
        id: m.id,
        url: m.thumbnail || "/gallery-1.png",
        videoUrl: m.url,
        title: m.title || "",
        type: "video" as const,
        views: m.viewCount ?? 0,
      };
    }
    // Fallback for any other types
    return {
      id: m.id,
      url: m.url || "/gallery-1.png",
      type: "photo" as const,
    };
  });

  // Transform fetched ratings to reviews format matching ReviewItem type
  const transformedReviews = fetchedRatings.map((r) => ({
    id: r.id,
    rating: r.rating,
    review: r.review || "",
    date: new Date(r.createdAt).toISOString().split("T")[0],
    user: {
      name: r.user.name || r.user.username,
      image: r.user.image || "",
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
  }));
  const [venues, setVenues] = useState<
    Array<{
      id: number;
      venueName: string;
      eventDate: string;
      description: string;
      countryId: number;
      cityId: number;
      countryName: string;
      cityName: string;
      latitude?: number | null;
      longitude?: number | null;
    }>
  >(
    ((djData as any)?.venues || (djData as any)?.venuesPlayed || []).map(
      (v: any) => ({
        id: v.id || 0,
        venueName: v.venueName || v.venue || "",
        eventDate: String(v.eventDate || v.date || ""),
        description: v.description || "",
        countryId: v.countryId || 0,
        cityId: v.cityId || 0,
        countryName: v.country?.name || v.country || "",
        cityName: v.city?.name || v.city || "",
        latitude: v.latitude ?? null,
        longitude: v.longitude ?? null,
      }),
    ),
  );
  const [highlights, setHighlights] = useState<
    Array<{
      id: number;
      year: string;
      title: string;
      description: string;
    }>
  >(
    ((djData as any)?.careerHighlights || []).map((h: any, i: number) => ({
      id: h.id || 0,
      year: String(h.year),
      title: h.title,
      description: h.description || "",
    })),
  );
  const [packages, setPackages] = useState<
    Array<{
      id: number;
      name: string;
      priceFrom: number;
      priceTo: number | null;
      currency: string;
      duration: string | null;
      features: string[];
      popular: boolean;
      sortOrder: number;
    }>
  >(
    ((djData as any)?.packages || [])
      .filter((p: any) => p.id != null && p.id !== undefined)
      .map((p: any) => ({
        id: p.id,
        name: p.name || "",
        priceFrom: p.priceFrom || 0,
        priceTo: p.priceTo || null,
        currency: p.currency || "USD",
        duration: p.duration || null,
        features: p.features || [],
        popular: p.popular || false,
        sortOrder: p.sortOrder || 0,
      })),
  );

  async function handleVenueSave(newVenues: typeof venues) {
    const toastId = toast.loading("Saving venues...");

    try {
      // Find new venues (id === 0)
      const venuesToAdd = newVenues.filter((v) => v.id === 0);
      // Find existing venues that were modified
      const venuesToUpdate = newVenues.filter((v) => v.id !== 0);
      // Find venues that were removed
      const removedVenueIds = venues
        .filter((v) => !newVenues.find((nv) => nv.id === v.id))
        .map((v) => v.id);

      // Add new venues
      const addedVenueIds: number[] = [];
      for (const venue of venuesToAdd) {
        if (!venue.venueName.trim() || !venue.countryId || !venue.cityId) {
          continue;
        }
        const result = await addVenue({
          djProfileId,
          venueName: venue.venueName.trim(),
          eventDate: venue.eventDate.trim() || null,
          description: venue.description.trim() || null,
          countryId: venue.countryId,
          cityId: venue.cityId,
          latitude: venue.latitude ?? null,
          longitude: venue.longitude ?? null,
        });
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
        if ("success" in result) {
          addedVenueIds.push(result.venue.id);
        }
      }

      // Update modified venues
      for (const venue of venuesToUpdate) {
        const result = await updateVenue({
          id: venue.id,
          venueName: venue.venueName.trim(),
          eventDate: venue.eventDate.trim() || null,
          description: venue.description.trim() || null,
          countryId: venue.countryId,
          cityId: venue.cityId,
          latitude: venue.latitude ?? null,
          longitude: venue.longitude ?? null,
        });
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      // Delete removed venues
      for (const venueId of removedVenueIds) {
        const result = await deleteVenue(venueId);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      toast.success("Venues saved successfully!", { id: toastId });

      // Update local state with new venue IDs
      const updatedVenues = newVenues.map((v, idx) => {
        if (v.id === 0 && addedVenueIds.length > 0) {
          const newId = addedVenueIds.shift();
          return { ...v, id: newId || 0 };
        }
        return v;
      });
      setVenues(updatedVenues);

      // Trigger page refresh to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to save venues:", error);
      toast.error("Failed to save venues. Please try again.", { id: toastId });
    }
  }

  async function handlePackageSave(newPackages: typeof packages) {
    const toastId = toast.loading("Saving packages...");

    try {
      // Find new packages (id === 0)
      const packagesToAdd = newPackages.filter((p) => p.id === 0);
      // Find existing packages that were modified
      const packagesToUpdate = newPackages.filter((p) => p.id !== 0);
      // Find packages that were removed
      const removedPackageIds = packages
        .filter((p) => !newPackages.find((np) => np.id === p.id))
        .map((p) => p.id);

      // Add new packages
      const addedPackageIds: number[] = [];
      for (const pkg of packagesToAdd) {
        if (!pkg.name.trim() || !pkg.priceFrom) {
          continue;
        }
        const formData = new FormData();
        formData.append("name", pkg.name.trim());
        formData.append("priceFrom", String(pkg.priceFrom));
        if (pkg.priceTo) formData.append("priceTo", String(pkg.priceTo));
        formData.append("currency", pkg.currency);
        formData.append("duration", pkg.duration || "");
        pkg.features.forEach((f) => formData.append("features", f));
        formData.append("popular", String(pkg.popular));
        formData.append("sortOrder", String(pkg.sortOrder));

        const result = await createDjPackage(formData);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
        if ("success" in result) {
          addedPackageIds.push(result.id);
        }
      }

      // Update modified packages
      for (const pkg of packagesToUpdate) {
        // Skip packages with invalid IDs
        if (!pkg.id || pkg.id === undefined || pkg.id === null) {
          continue;
        }
        const formData = new FormData();
        formData.append("name", pkg.name.trim());
        formData.append("priceFrom", String(pkg.priceFrom));
        if (pkg.priceTo !== null)
          formData.append("priceTo", String(pkg.priceTo));
        formData.append("currency", pkg.currency);
        formData.append("duration", pkg.duration || "");
        pkg.features.forEach((f) => formData.append("features", f));
        formData.append("popular", String(pkg.popular));
        formData.append("sortOrder", String(pkg.sortOrder));

        const result = await updateDjPackage(pkg.id, formData);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      // Delete removed packages
      for (const packageId of removedPackageIds) {
        const result = await deleteDjPackage(packageId);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      toast.success("Packages saved successfully!", { id: toastId });

      // Update local state with new package IDs
      const updatedPackages = newPackages.map((p, idx) => {
        if (p.id === 0 && addedPackageIds.length > 0) {
          const newId = addedPackageIds.shift();
          return { ...p, id: newId || 0 };
        }
        return p;
      });
      setPackages(updatedPackages);

      // Trigger page refresh to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to save packages:", error);
      toast.error("Failed to save packages. Please try again.", {
        id: toastId,
      });
    }
  }

  async function handleHighlightSave(newHighlights: typeof highlights) {
    const toastId = toast.loading("Saving highlights...");

    try {
      // Find new highlights (id === 0)
      const highlightsToAdd = newHighlights.filter((h) => h.id === 0);
      // Find existing highlights that were modified
      const highlightsToUpdate = newHighlights.filter((h) => h.id !== 0);
      // Find highlights that were removed
      const removedHighlightIds = highlights
        .filter((h) => !newHighlights.find((nh) => nh.id === h.id))
        .map((h) => h.id);

      // Add new highlights
      const addedHighlightIds: number[] = [];
      for (const highlight of highlightsToAdd) {
        if (!highlight.year.trim() || !highlight.title.trim()) {
          continue;
        }
        const formData = new FormData();
        formData.append("year", highlight.year.trim());
        formData.append("title", highlight.title.trim());
        if (highlight.description.trim()) {
          formData.append("description", highlight.description.trim());
        }

        const result = await createDjHighlight(formData);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
        if ("success" in result) {
          addedHighlightIds.push(result.id);
        }
      }

      // Update modified highlights
      for (const highlight of highlightsToUpdate) {
        if (
          !highlight.id ||
          highlight.id === undefined ||
          highlight.id === null
        ) {
          continue;
        }
        const formData = new FormData();
        formData.append("year", highlight.year.trim());
        formData.append("title", highlight.title.trim());
        formData.append("description", highlight.description.trim());

        const result = await updateDjHighlight(highlight.id, formData);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      // Delete removed highlights
      for (const highlightId of removedHighlightIds) {
        const result = await deleteDjHighlight(highlightId);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      toast.success("Highlights saved successfully!", { id: toastId });

      // Update local state with new highlight IDs
      const updatedHighlights = newHighlights.map((h, idx) => {
        if (h.id === 0 && addedHighlightIds.length > 0) {
          const newId = addedHighlightIds.shift();
          return { ...h, id: newId || 0 };
        }
        return h;
      });
      setHighlights(updatedHighlights);

      // Trigger page refresh to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to save highlights:", error);
      toast.error("Failed to save highlights. Please try again.", {
        id: toastId,
      });
    }
  }

  async function handlePressSave(newPressItems: typeof pressItems) {
    const toastId = toast.loading("Saving press items...");

    function normalizeUrl(url: string): string {
      const trimmed = url.trim();
      if (!trimmed) return "";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    }

    try {
      // IDs > 1000000000000 are temporary Date.now() IDs (new items not yet saved)
      const TEMP_ID_THRESHOLD = 1000000000000;
      const itemsToAdd = newPressItems.filter((p) => p.id > TEMP_ID_THRESHOLD);
      const itemsToUpdate = newPressItems.filter(
        (p) => p.id > 0 && p.id <= TEMP_ID_THRESHOLD,
      );
      const removedItemIds = pressItems
        .filter((p) => !newPressItems.find((np) => np.id === p.id))
        .map((p) => p.id)
        .filter((id) => id > 0 && id <= TEMP_ID_THRESHOLD); // Only delete real DB IDs

      const addedItemIds: number[] = [];
      for (const item of itemsToAdd) {
        if (!item.source.trim() || !item.title.trim()) {
          continue;
        }
        const formData = new FormData();
        formData.append("source", item.source.trim());
        formData.append("type", item.type.trim());
        formData.append("title", item.title.trim());
        if (item.date.trim()) formData.append("date", item.date.trim());
        const normalizedUrl = normalizeUrl(item.url);
        if (normalizedUrl) formData.append("url", normalizedUrl);

        const result = await createDjPressItem(formData);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
        if ("success" in result) {
          addedItemIds.push(result.id);
        }
      }

      for (const item of itemsToUpdate) {
        if (!item.id || item.id === undefined || item.id === null) {
          continue;
        }
        const formData = new FormData();
        formData.append("source", item.source.trim());
        formData.append("type", item.type.trim());
        formData.append("title", item.title.trim());
        formData.append("date", item.date.trim());
        const normalizedUrl = normalizeUrl(item.url);
        formData.append("url", normalizedUrl);

        const result = await updateDjPressItem(item.id, formData);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      for (const itemId of removedItemIds) {
        const result = await deleteDjPressItem(itemId);
        if ("error" in result) {
          toast.error(result.error, { id: toastId });
          return;
        }
      }

      toast.success("Press items saved successfully!", { id: toastId });

      const updatedItems = newPressItems.map((p) => {
        if (p.id > TEMP_ID_THRESHOLD && addedItemIds.length > 0) {
          const newId = addedItemIds.shift();
          return { ...p, id: newId || 0, url: normalizeUrl(p.url) };
        }
        return { ...p, url: normalizeUrl(p.url) };
      });
      setPressItems(updatedItems);

      window.location.reload();
    } catch (error) {
      console.error("Failed to save press items:", error);
      toast.error("Failed to save press items. Please try again.", {
        id: toastId,
      });
    }
  }

  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

  // In staging: use real data if available, supplement with demo data
  // In production: only use real data
  const DJ = djData
    ? mapPremiumDjToProps(djData)
    : isStaging
      ? PREMIUM_DEFAULT_DJ
      : null;
  const EVENTS =
    eventsHasLoaded && lazyEvents
      ? lazyEvents
      : djData
        ? mapPremiumEventsFromData(djData) || []
        : isStaging
          ? PREMIUM_DEFAULT_EVENTS
          : [];
  const REVIEWS = (
    djData
      ? transformedReviews.length > 0
        ? transformedReviews
        : mapPremiumReviewsFromData(djData) || []
      : isStaging
        ? PREMIUM_DEFAULT_REVIEWS
        : []
  ) as ReviewItem[];
  const MEDIA = djData
    ? transformedMedia.length > 0
      ? transformedMedia
      : mapPremiumMediaFromData(djData) || []
    : isStaging
      ? PREMIUM_DEFAULT_MEDIA
      : [];
  const ENDORSEMENTS =
    endorsementsHasLoaded && lazyEndorsements
      ? lazyEndorsements
      : djData
        ? mapEndorsementsFromData(djData) || []
        : isStaging
          ? PREMIUM_DEFAULT_ENDORSEMENTS
          : [];
  const HIGHLIGHTS =
    highlightsHasLoaded && lazyHighlights
      ? lazyHighlights.map((h: any, i: number) => ({
          ...h,
          icon: HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length],
          description: h.description ?? undefined,
        }))
      : djData
        ? mapHighlightsFromData(djData) || []
        : isStaging
          ? PREMIUM_DEFAULT_HIGHLIGHTS
          : [];
  const PRESS =
    pressHasLoaded && lazyPress
      ? lazyPress.map((p: any) => ({
          ...p,
          icon: PRESS_ICON_MAP[p.type] ?? Newspaper,
        }))
      : djData
        ? mapPressFromData(djData) || []
        : isStaging
          ? PREMIUM_DEFAULT_PRESS
          : [];
  const PACKAGES =
    packagesHasLoaded && lazyPackages
      ? lazyPackages
      : djData
        ? mapPackagesFromData(djData) || []
        : isStaging
          ? PREMIUM_DEFAULT_PACKAGES
          : [];
  const CALENDAR_DAYS =
    calendarHasLoaded && lazyCalendar
      ? buildCalendarFromData({
          ...(djData as any),
          availability: {
            month:
              (lazyCalendar as any)?.availabilityMonth ??
              (lazyCalendar as any)?.availability?.month ??
              "",
            availableDays:
              (lazyCalendar as any)?.availabilityDays ??
              (lazyCalendar as any)?.availability?.availableDays ??
              [],
            timezone:
              (lazyCalendar as any)?.timezone ??
              (djData as any)?.availability?.timezone ??
              "UTC",
          },
        })
      : djData
        ? buildCalendarFromData(djData)
        : isStaging
          ? PREMIUM_DEFAULT_CALENDAR_DAYS
          : [];
  const MIXES =
    mixesHasLoaded && lazyMixes
      ? lazyMixes
      : djData
        ? mapMixesFromData(djData)
        : isStaging
          ? PREMIUM_DEFAULT_MIXES
          : [];
  const calendarLabel = djData
    ? getCalendarMonthLabel(djData)
    : isStaging
      ? "September 2025"
      : "";
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
        : isStaging
          ? PREMIUM_DEFAULT_SPOTLIGHT
          : null;
  const featuredVideoUrl = SPOTLIGHT?.featuredVideo?.videoUrl ?? "";
  const featuredVideoThumb =
    SPOTLIGHT?.featuredVideo?.thumbnail ||
    getVideoThumbnailUrl(featuredVideoUrl) ||
    "/gallery-2.png";
  const featuredMixAudioUrl = SPOTLIGHT?.featuredMix?.audioUrl ?? "";
  const autoMixThumb = useAudioThumbnail(featuredMixAudioUrl);
  const featuredMixThumb =
    SPOTLIGHT?.featuredMix?.thumbnail || autoMixThumb || "/gallery-2.png";
  const location = DJ ? `${DJ.city}, ${DJ.country}` : "";

  // Early return in production if no data available
  if (!DJ && isProduction) {
    return null;
  }

  // After this point, DJ and SPOTLIGHT are guaranteed to be non-null
  // (either from real data or demo defaults in staging)
  const safeDJ = DJ!;
  const safeSPOTLIGHT = SPOTLIGHT!;

  const bookingContext: BookingViewerContext = viewerContext ?? {
    role: "guest",
    isAuthenticated: false,
  };

  const isOwner = viewMode === "dj-owner";
  const editHref = "/dj/settings";

  return (
    <div className="min-h-screen bg-black">
      {/* ── PREMIUM HERO ── */}
      <DjProfileHero
        djData={djData as DjDemoData}
        viewMode={viewMode}
        isFollowed={isFollowed}
        reputationScore={reputationScore}
        reputationDetail={reputationDetail}
        status={status}
        variant="premium"
      />

      {/* ── PAGE BODY ── */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── MAIN COLUMN ── */}
          <div className="flex flex-col gap-12 lg:col-span-2">
            {/* ── STICKY SUB-NAVIGATION ── */}
            <div className="bg-h_blackLight/30 sticky top-[4.125rem] z-40 rounded-lg border border-white/8 px-4 py-2 shadow-md shadow-black/20 backdrop-blur-sm">
              <DjProfileSubNav />
            </div>
            {/* ── MOBILE BOOK CTA ── */}
            <BookCTA
              ref={bookCTARefMobile}
              stageName={`Dj. ${safeDJ.stageName}`}
              djProfileId={djProfileId}
              viewer={bookingContext}
              variant="premium"
              layout="mobile"
              responseRate={safeDJ.responseRate}
              bookingSuccessRate={safeDJ.bookingSuccessRate}
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
                calendarDays={
                  CALENDAR_DAYS as Array<{
                    day: number;
                    status: "available" | "booked" | "tentative" | "free";
                  }>
                }
                calendarLabel={calendarLabel}
                isOwner={isOwner}
                djName={safeDJ.stageName}
                featuredPerformanceUrl={djData?.featuredPerformanceUrl}
                featuredPerformanceContext={djData?.featuredPerformanceContext}
                featuredPerformanceThumbnailUrl={
                  djData?.featuredPerformanceThumbnailUrl
                }
              />
            </div>

            {/* ── EXTENDED MEDIA LIBRARY ── */}
            <section id="media">
              <SectionHeading sub="Full media library · Unlimited with Premium">
                Media
              </SectionHeading>

              {/* ── SPOTLIGHT (nested inside Media) ── */}
              {safeSPOTLIGHT &&
                (safeSPOTLIGHT.featuredMix?.audioUrl ||
                  safeSPOTLIGHT.featuredVideo?.videoUrl) && (
                  <>
                    <h3 className="mb-4 text-sm font-semibold text-gray-400">
                      Spotlight
                    </h3>
                    <div className="mb-8 flex flex-nowrap gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid">
                      {safeSPOTLIGHT.featuredMix?.audioUrl && (
                        <MediaAudioPlayer
                          audioUrl={safeSPOTLIGHT.featuredMix.audioUrl}
                          title={safeSPOTLIGHT.featuredMix.title}
                          thumbnailUrl={featuredMixThumb || undefined}
                          mediaId={safeSPOTLIGHT.featuredMix.id}
                        >
                          <Card className="bg-h_blackLight/30 group h-full min-w-72 cursor-pointer gap-0 overflow-hidden border-white/8 transition-all hover:border-amber-500/30 sm:min-w-0">
                            <div className="from-h_red/20 relative h-44 bg-linear-to-br to-black">
                              {featuredMixThumb ? (
                                <Image
                                  src={featuredMixThumb}
                                  alt={safeSPOTLIGHT.featuredMix.title}
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
                                {safeSPOTLIGHT.featuredMix.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {safeSPOTLIGHT.featuredMix.duration} ·{" "}
                                {formatPlays(safeSPOTLIGHT.featuredMix.plays)}{" "}
                                plays
                              </p>
                            </div>
                          </Card>
                        </MediaAudioPlayer>
                      )}
                      {safeSPOTLIGHT.featuredVideo?.videoUrl && (
                        <MediaVideoModal
                          videoUrl={safeSPOTLIGHT.featuredVideo.videoUrl}
                          thumbnail={featuredVideoThumb}
                          title={
                            safeSPOTLIGHT.featuredVideo?.title ??
                            "Featured video"
                          }
                          mediaId={safeSPOTLIGHT.featuredVideo?.id}
                        >
                          <Card className="bg-h_blackLight/30 group h-full min-w-72 cursor-pointer gap-0 overflow-hidden border-white/8 transition-all hover:border-amber-500/30 sm:min-w-0">
                            <div className="relative h-44 overflow-hidden">
                              <Image
                                src={featuredVideoThumb}
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
                                  Featured Video
                                </Badge>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-sm font-semibold text-white">
                                {safeSPOTLIGHT.featuredVideo?.title ??
                                  "Featured video"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {safeSPOTLIGHT.featuredVideo?.duration} ·{" "}
                                {formatPlays(
                                  safeSPOTLIGHT.featuredVideo?.views ?? 0,
                                )}{" "}
                                views
                              </p>
                            </div>
                          </Card>
                        </MediaVideoModal>
                      )}
                    </div>
                  </>
                )}

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
                          className="aspect-square animate-pulse rounded-lg bg-white/5"
                        />
                      ))}
                    </div>
                  ) : (
                    <MediaGalleryLightbox
                      photos={MEDIA.filter((m) => m.type === "photo")}
                    />
                  )}
                </>
              )}
              {mediaTab === "videos" && (
                <>
                  {mediaIsLoading && MEDIA.length === 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-video animate-pulse rounded-lg bg-white/5"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {MEDIA.filter((m) => m.type === "video").map((m) => (
                        <MediaVideoModal
                          key={m.id}
                          videoUrl={m.videoUrl ?? ""}
                          thumbnail={
                            getVideoThumbnailUrl(m.videoUrl ?? "") || m.url
                          }
                          title={m.title ?? "Video"}
                          mediaId={m.id}
                        >
                          <div className="hover:ring-h_red/40 group relative aspect-video cursor-pointer overflow-hidden rounded-lg ring-1 ring-white/5 transition-all">
                            <Image
                              src={
                                getVideoThumbnailUrl(m.videoUrl ?? "") || m.url
                              }
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
                  )}
                </>
              )}
              {mediaTab === "mixes" && (
                <div className="flex flex-col gap-3">
                  {MIXES.filter((m: any) => m.audioUrl).length > 0 ? (
                    MIXES.filter((m: any) => m.audioUrl).map(
                      (mix: any, i: number) => (
                        <MixPlayer key={mix.id || mix.title || i} mix={mix} />
                      ),
                    )
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      No mixes uploaded yet
                    </div>
                  )}
                </div>
              )}

              {/* Load More button for media */}
              {totalNonAudioCount > 6 && mediaHasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={loadMoreMedia}
                    disabled={mediaIsLoading}
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    {mediaIsLoading ? "Loading..." : "Load More Media"}
                  </Button>
                </div>
              )}
            </section>

            <Separator className="bg-white/8" />

            {/* ── CAREER HIGHLIGHTS ── */}
            <CareerHighlights
              highlights={HIGHLIGHTS}
              isOwner={isOwner}
              onAddHighlight={() => setIsHighlightModalOpen(true)}
            />

            <Separator className="bg-white/8" />

            {/* ── WHERE I'VE PLAYED ── */}
            <div ref={venuesTargetRef}>
              <WhereIvePlayed
                venues={
                  venuesHasLoaded && lazyVenues.length > 0
                    ? lazyVenues.map((v) => ({
                        id: v.id,
                        venueName: v.venueName,
                        eventDate: v.eventDate,
                        description: v.description,
                        city: { name: v.cityName },
                        country: { name: v.countryName },
                        latitude: v.latitude,
                        longitude: v.longitude,
                      }))
                    : (
                        (djData as any)?.venues ||
                        (djData as any)?.venuesPlayed ||
                        []
                      ).map((v: any) => ({
                        id: v.id || 0,
                        venueName: v.venueName || v.venue,
                        eventDate: v.eventDate || v.date || null,
                        description: v.description || null,
                        city: { name: v.city?.name || v.city || "" },
                        country: { name: v.country?.name || v.country || "" },
                        latitude: v.latitude,
                        longitude: v.longitude,
                      }))
                }
                isOwner={isOwner}
                onAddVenue={() => setIsVenueModalOpen(true)}
              />
            </div>

            {ENDORSEMENTS.length > 0 && (
              <>
                <Separator className="bg-white/8" />

                {/* ── INDUSTRY ENDORSEMENTS ── */}
                <section ref={endorsementsTargetRef}>
                  <SectionHeading sub="What industry professionals say">
                    Industry Endorsements
                  </SectionHeading>
                  {endorsementsIsLoading && !endorsementsHasLoaded ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="h-24 animate-pulse rounded-lg bg-white/5"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {ENDORSEMENTS.map((e: any) => (
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
                              <p className="mb-2 text-xs text-gray-400">
                                {e.role}
                              </p>
                              <p className="text-sm leading-relaxed text-gray-300 italic">
                                &ldquo;{e.quote}&rdquo;
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {(PRESS.length > 0 || isOwner) && (
              <>
                <Separator className="bg-white/8" />

                {/* ── PRESS & MEDIA ── */}
                <section id="press" ref={pressTargetRef}>
                  <div className="mb-5 flex items-center justify-between">
                    <SectionHeading sub="Interviews, features, and podcasts">
                      Press &amp; Media
                    </SectionHeading>
                    {isOwner && PRESS.length > 0 && (
                      <Button
                        onClick={() => setIsPressModalOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        <Pencil className="mr-1.5 h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {pressIsLoading && PRESS.length === 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-20 animate-pulse rounded-lg bg-white/5"
                        />
                      ))}
                    </div>
                  ) : PRESS.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PRESS.map((p: any) => {
                        const PressIcon = p.icon;
                        const cardContent = (
                          <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/8 bg-white/5">
                              <PressIcon className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-0.5 flex items-center gap-2">
                                <span className="text-h_redLight text-xs font-bold">
                                  {p.outlet}
                                </span>
                                <Badge className="border-white/8 bg-white/5 text-[11px] text-gray-400">
                                  {p.type}
                                </Badge>
                              </div>
                              <p className="line-clamp-2 text-sm font-medium text-white">
                                {p.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {p.date}
                              </p>
                            </div>
                          </div>
                        );
                        return p.url ? (
                          <a
                            key={p.id}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Card className="bg-h_blackLight/30 group h-full cursor-pointer gap-0 border-white/8 p-4 transition-colors hover:border-white/15">
                              {cardContent}
                            </Card>
                          </a>
                        ) : (
                          <Card
                            key={p.id}
                            className="bg-h_blackLight/30 group gap-0 border-white/8 p-4"
                          >
                            {cardContent}
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptySectionState
                      icon={Newspaper}
                      title="No press items yet"
                      description="Add interviews, features, and podcast appearances"
                      actionLabel="Add Press"
                      onAction={() => setIsPressModalOpen(true)}
                    />
                  )}
                </section>
              </>
            )}

            <Separator className="bg-white/8" />

            <section id="reviews">
              <SectionHeading sub="What people say about this DJ">
                Reviews
              </SectionHeading>
              {ratingsIsLoading ? (
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

            {/* ── BOOKING PACKAGES ── */}
            {(packages.length > 0 || isOwner) && (
              <>
                <Separator className="bg-white/8" />
                <section id="packages" ref={packagesTargetRef}>
                  <div className="mb-5 flex items-center justify-between">
                    <SectionHeading sub="Tailored options for every event type">
                      Booking Packages
                    </SectionHeading>
                    {isOwner && packages.length > 0 && (
                      <Button
                        onClick={() => setIsPackageModalOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        <Pencil className="mr-1.5 h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {packagesIsLoading && PACKAGES.length === 0 ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="h-32 animate-pulse rounded-lg bg-white/5"
                        />
                      ))}
                    </div>
                  ) : PACKAGES.length > 0 ? (
                    <BookingPackages
                      packages={[...PACKAGES]
                        .sort((a, b) => {
                          // Popular packages first
                          if (a.popular && !b.popular) return -1;
                          if (!a.popular && b.popular) return 1;
                          // Then by sortOrder
                          return a.sortOrder - b.sortOrder;
                        })
                        .map((p) => ({
                          id: p.id,
                          name: p.name,
                          priceFrom: p.priceFrom,
                          priceTo: p.priceTo,
                          currency: p.currency,
                          duration: p.duration,
                          features: p.features || [],
                          popular: p.popular,
                        }))}
                      viewerRole={bookingContext.role}
                      openBookingModal={(
                        packageName,
                        packagePrice,
                        packagePriceTo,
                      ) => {
                        bookCTARefMobile.current?.openBookingModal(
                          packageName,
                          packagePrice,
                          packagePriceTo,
                        );
                        bookCTARefDesktop.current?.openBookingModal(
                          packageName,
                          packagePrice,
                          packagePriceTo,
                        );
                      }}
                    />
                  ) : (
                    <EmptySectionState
                      icon={BriefcaseBusiness}
                      title="No packages added yet"
                      description="Create packages to help organizers understand your offerings"
                      actionLabel="Add Packages"
                      onAction={() => setIsPackageModalOpen(true)}
                    />
                  )}
                </section>
                <Separator className="bg-white/8" />
              </>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="sticky top-[4.125rem] hidden h-fit flex-col gap-5 lg:flex">
            {/* Priority Booking CTA — desktop only; mobile version is inline above */}
            <BookCTA
              ref={bookCTARefDesktop}
              stageName={`Dj. ${safeDJ.stageName}`}
              djProfileId={djProfileId}
              viewer={bookingContext}
              variant="premium"
              layout="desktop"
              responseRate={safeDJ.responseRate}
              bookingSuccessRate={safeDJ.bookingSuccessRate}
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
                      {safeDJ.responseRate > 0
                        ? `${safeDJ.responseRate}% response rate`
                        : "Typically replies within 24h"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {safeDJ.responseRate > 0
                      ? `${safeDJ.responseRate}%`
                      : "Fast"}
                  </p>
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

            <Separator className="bg-white/8" />

            {/* Professional Team */}
            <ProfessionalTeamSidebar
              managerName={safeDJ.manager.name}
              managerEmail={safeDJ.manager.email}
              agentName={safeDJ.agent.name}
              agentAgency={safeDJ.agent.agency}
              agentEmail={safeDJ.agent.email}
            />

            <Separator className="bg-white/8" />

            {/* Fee Range */}
            <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Fee Range
              </h3>
              <div className="mb-1 flex items-end gap-2">
                <span className="text-2xl font-bold text-white">
                  {safeDJ.minFee}
                </span>
                <span className="mb-0.5 text-sm text-gray-400">
                  – {safeDJ.maxFee}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Per event · varies by duration & travel
              </p>
            </Card>

            {/* Analytics snapshot (owner-only in fan view) */}
            <OwnerOnlySection viewMode={viewMode}>
              <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ChartLine className="h-3.5 w-3.5 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-white">
                    This Month
                  </h3>
                </div>
                {(
                  [
                    {
                      label: "Profile Views",
                      val: djData?.analytics.profileViews.value ?? 0,
                      growth: djData?.analytics.profileViews.growth ?? 0,
                    },
                    {
                      label: "Booking Requests",
                      val: djData?.analytics.bookingRequests.value ?? 0,
                      growth: djData?.analytics.bookingRequests.growth ?? 0,
                    },
                    {
                      label: "New Followers",
                      val: djData?.analytics.newFollowers.value ?? 0,
                      growth: djData?.analytics.newFollowers.growth ?? 0,
                    },
                  ] as const
                ).map((m) => (
                  <div
                    key={m.label}
                    className="mb-2 flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-400">{m.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {m.val.toLocaleString()}
                      </span>
                      <span
                        className={
                          m.growth >= 0
                            ? "text-[11px] text-emerald-400"
                            : "text-[11px] text-red-400"
                        }
                      >
                        {m.growth >= 0 ? "+" : ""}
                        {m.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            </OwnerOnlySection>
          </aside>
        </div>
      </div>

      {isOwner && (
        <>
          <VenueModal
            key={isVenueModalOpen ? "venue-modal-open" : "venue-modal-closed"}
            isOpen={isVenueModalOpen}
            onClose={() => setIsVenueModalOpen(false)}
            venues={venues}
            onSave={handleVenueSave}
            countries={countries || []}
            djProfileId={djProfileId}
          />
          <PackageModal
            key={
              isPackageModalOpen ? "package-modal-open" : "package-modal-closed"
            }
            isOpen={isPackageModalOpen}
            onClose={() => setIsPackageModalOpen(false)}
            packages={packages}
            onSave={handlePackageSave}
            djProfileId={djProfileId}
          />
          <HighlightModal
            key={
              isHighlightModalOpen
                ? "highlight-modal-open"
                : "highlight-modal-closed"
            }
            isOpen={isHighlightModalOpen}
            onClose={() => setIsHighlightModalOpen(false)}
            highlights={highlights}
            onSave={handleHighlightSave}
          />
          <PressModal
            key={isPressModalOpen ? "press-modal-open" : "press-modal-closed"}
            isOpen={isPressModalOpen}
            onClose={() => setIsPressModalOpen(false)}
            pressItems={pressItems}
            onSave={handlePressSave}
          />
        </>
      )}

      {/* ── MOBILE BOTTOM BAR ── */}
      <DjProfileMobileBottomBar
        feeMin={djData?.booking?.feeRange?.min}
        feeMax={djData?.booking?.feeRange?.max}
        feeCurrency={djData?.booking?.feeRange?.currency}
        onBookClick={() => bookCTARefMobile.current?.openBookingModal()}
        isOwner={isOwner}
      />
    </div>
  );
}
