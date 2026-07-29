import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/client";
import DjProfileFree from "@/components/dj-profile/DjProfileFree";
import DjProfilePremium from "@/components/dj-profile/DjProfilePremium";
import { ProfileViewTracker } from "@/components/dj-profile/ProfileViewTracker";
import { getDemodjBySlug } from "@/data/djs";
import type { DjDemoData } from "@/types/dj-demo";
import { getCitiesForCountry, getVenuesForCity } from "@/lib/actions/locations";
import { fetchYouTubeOEmbed } from "@/lib/actions/media";
import {
  getDjResponseRate,
  getDjBookingRate,
  getDjTopCities,
} from "@/lib/queries/dj-stats";
import { getProfileStats } from "@/lib/actions/dj-analytics";
import { batchGeocodeVenues } from "@/lib/actions/geocoding";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600; // Cache for 1 hour

export default async function DjProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const showDemo = process.env.NEXT_PUBLIC_APP_ENV !== "production";

  if (slug === "demo-free") {
    if (!showDemo) return notFound();
    return (
      <div>
        <div className="bg-h_blackLight/60 flex items-center justify-center gap-4 border-b border-white/8 px-4 py-2 text-center text-xs font-medium tracking-wide text-gray-300">
          <span className="opacity-60">Version 1 — Free DJ Profile</span>
          <span className="opacity-30">·</span>
          <Link
            href="/djs/demo-premium"
            className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            Switch to Premium Version →
          </Link>
        </div>
        <DjProfileFree />
      </div>
    );
  }

  if (slug === "demo-premium") {
    if (!showDemo) return notFound();
    const demoDj = getDemodjBySlug("amara-pulse");
    if (!demoDj) return notFound();
    return (
      <div>
        <div className="flex items-center justify-center gap-4 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium tracking-wide text-amber-300">
          <span className="opacity-80">Version 2 — Premium DJ Profile</span>
          <span className="opacity-30">·</span>
          <Link
            href="/djs/demo-free"
            className="text-gray-400 underline underline-offset-2 hover:text-gray-200"
          >
            ← Switch to Free Version
          </Link>
        </div>
        <DjProfilePremium djData={demoDj} viewMode="fan" status="APPROVED" />
      </div>
    );
  }

  // ── JSON demo data lookup (dev/staging only) ─────────────────────────────
  if (showDemo) {
    const demoDj = getDemodjBySlug(slug);
    if (demoDj) {
      if (demoDj.plan === "free") {
        return <DjProfileFree djData={demoDj} viewMode="fan" />;
      }
      return (
        <DjProfilePremium djData={demoDj} viewMode="fan" status="APPROVED" />
      );
    }
  }

  // ── Prisma DB lookup (production) ─────────────────────────────────────────
  // Split into focused queries for better performance
  const [djCore, spotlightMedia, basicCounts, ratingAgg, eventCount] =
    await Promise.all([
      // Core profile data for hero section
      prisma.djProfile.findUnique({
        where: { slug },
        select: {
          id: true,
          userId: true,
          stageName: true,
          slug: true,
          bio: true,
          experienceYears: true,
          experienceLevel: true,
          avatar: true,
          coverImage: true,
          countryId: true,
          cityId: true,
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          plan: true,
          status: true,
          featured: true,
          hidden: true,
          bookingEmail: true,
          bookingPhone: true,
          feeMin: true,
          feeMax: true,
          feeCurrency: true,
          monthlyViews: true,
          reputationScore: true,
          user: {
            select: {
              id: true,
            },
          },
          country: { select: { name: true } },
          genres: { include: { genre: { select: { name: true } } } },
          djTypes: true,
          socialLinks: true,
          // Non-critical fields removed (will be fetched separately):
          // - managerName, managerEmail, managerPhone (ProfessionalTeamSidebar)
          // - agentName, agentAgency, agentEmail (ProfessionalTeamSidebar)
          // - availabilityTimezone, availabilityMonth, availabilityDays (availability section)
          // - featuredPerformanceUrl, featuredPerformanceContext (featured performance section)
          // - reputationDetail (owner-only analytics)
        },
      }),
      // Spotlight media only (featured mix/video)
      prisma.media.findMany({
        where: { djProfile: { slug }, isSpotlight: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          type: true,
          url: true,
          title: true,
          duration: true,
          thumbnail: true,
          isSpotlight: true,
          sortOrder: true,
          playCount: true,
          viewCount: true,
        },
      }),
      // Basic counts for stats display
      prisma.djProfile.findUnique({
        where: { slug },
        select: {
          _count: {
            select: { ratings: true, followers: true },
          },
        },
      }),
      // Rating aggregate for avgRating
      prisma.djRating.aggregate({
        where: { djProfile: { slug } },
        _avg: { rating: true },
      }),
      // Public events count (where DJ is owner)
      prisma.event.count({
        where: {
          ownerDj: { slug },
          status: "PUBLISHED",
        },
      }),
    ]);

  // NOTE: This page is a static, ISR-cached shell (see `export const revalidate`
  // above). It intentionally contains NO cookies()/auth reads so caching stays
  // effective. Per-viewer state (follow status, booking role, dj-owner view)
  // is fetched client-side via useViewerContext -> /api/djs/[slug]/viewer-context.
  //
  // As a result, pending/hidden profiles are never publicly visible, even to
  // their owner, via this URL. Owners preview their pending/hidden profile
  // through their authenticated dashboard instead.
  if (!djCore || djCore.status !== "APPROVED" || djCore.hidden)
    return notFound();

  // Combine results for backward compatibility
  const dj = {
    ...djCore,
    media: spotlightMedia,
    _count: basicCounts?._count || { ratings: 0, followers: 0 },
    // Add default values for removed non-critical fields
    managerName: null,
    managerEmail: null,
    managerPhone: null,
    agentName: null,
    agentAgency: null,
    agentEmail: null,
    availabilityTimezone: null,
    availabilityMonth: null,
    availabilityDays: null,
    featuredPerformanceUrl: null,
    featuredPerformanceContext: null,
    reputationDetail: null,
  };

  // Geocode venues for map display
  // DISABLED: Venues will be lazy-loaded in Phase 4
  // const venuesWithCoords = await batchGeocodeVenues(
  //   (dj.venues || []).map((v) => ({
  //     id: v.id,
  //     venueName: v.venueName,
  //     city: v.city,
  //     country: v.country,
  //     latitude: v.latitude,
  //     longitude: v.longitude,
  //   })),
  // );

  // Lookup freshly geocoded coordinates by venue ID
  const coordLookup = new Map(); // Empty until venues are lazy-loaded

  // Profile view tracking moved to client-side to avoid firing during prefetch/re-renders

  // Analytics data is now fetched client-side via API endpoints with caching
  // See: DjProfilePremium/DjProfileFree components for client-side fetching
  const avgRating = ratingAgg._avg.rating ?? 0; // Server-side computed for JSON-LD
  const publicEventsCount = eventCount; // Server-side computed for JSON-LD
  const responseRate = 0; // Will be updated client-side
  const bookingRate = 0; // Will be updated client-side
  const topCities: Array<{ city: string; country: string; count: number }> = []; // Will be updated client-side
  const ownerProfileStats: {
    profileViews?: { value: number; growth: number };
    bookingRequests?: { value: number; growth: number };
    newFollowers?: { value: number; growth: number };
  } | null = null; // Will be updated client-side

  // DISABLED: YouTube oEmbed fetch since featuredPerformanceUrl is now null (will be fetched in Phase 5)
  const featuredPerformanceThumbnailUrl: string | undefined = undefined;

  const djPlan = dj.plan;
  const djVerified = dj.status === "APPROVED";
  const djFeatured = dj.featured;
  const djBookingEmail = dj.bookingEmail ?? "";
  const djBookingPhone = dj.bookingPhone ?? "";
  const djFeeMin = dj.feeMin ?? 0;
  const djFeeMax = dj.feeMax ?? 0;
  const djFeeCurrency = dj.feeCurrency ?? "USD";

  const websiteLink =
    dj.socialLinks.find((s) => s.platform === "website")?.url ?? "";

  const djDemoData: DjDemoData = {
    id: String(dj.id),
    slug: dj.slug,
    type: "fictional_demo",
    plan: djPlan === "PREMIUM" ? "premium" : "free",
    featured: djFeatured,
    name: dj.stageName,
    stageName: dj.stageName,
    experienceYears: dj.experienceYears ?? undefined,
    experienceLevel: dj.experienceLevel ?? undefined,
    location: {
      city: dj.city?.name ?? "",
      country: dj.country?.name ?? "",
    },
    avatar: {
      url: dj.avatar || "/noAvatar.png",
      alt: dj.stageName,
    },
    coverImage: {
      url: dj.coverImage || "/noCover.png",
      alt: `${dj.stageName} cover`,
    },
    genres: dj.genres.map((g) => g.genre.name),
    socials: dj.socialLinks.reduce<DjDemoData["socials"]>(
      (acc, s) => ({ ...acc, [s.platform]: s.url }),
      {},
    ),
    stats: {
      followers: dj._count.followers,
      rating: avgRating,
      reviews: dj._count.ratings,
      events: publicEventsCount,
      responseRate,
      bookingRate,
      monthlyViews: dj.monthlyViews ?? 0,
    },
    spotlight: {
      featuredMix: (() => {
        const mix = dj.media.find((m) => m.type === "AUDIO" && m.isSpotlight);
        return {
          id: mix?.id,
          title: mix?.title ?? "",
          duration: mix?.duration ?? "",
          plays: mix?.playCount ?? 0,
          genres: [],
          audioUrl: mix?.url ?? "",
          thumbnail: mix?.thumbnail ?? dj.coverImage ?? "/noCover.png",
        };
      })(),
      featuredVideo: (() => {
        const video = dj.media.find((m) => m.type === "VIDEO" && m.isSpotlight);
        return {
          id: video?.id,
          title: video?.title ?? "",
          subtitle: "",
          duration: video?.duration ?? "",
          views: video?.viewCount ?? 0,
          thumbnail: video?.thumbnail ?? dj.coverImage ?? "/noCover.png",
          videoUrl: video?.url ?? "",
        };
      })(),
    },
    analytics: {
      profileViews: (ownerProfileStats as any)?.profileViews ?? {
        value: dj.monthlyViews ?? 0,
        growth: 0,
      },
      bookingRequests: (ownerProfileStats as any)?.bookingRequests ?? {
        value: 0,
        growth: 0,
      },
      newFollowers: (ownerProfileStats as any)?.newFollowers ?? {
        value: 0,
        growth: 0,
      },
      bookingRate,
      topCities: (() => {
        const total = topCities.reduce((sum, c) => sum + c.count, 0);
        return topCities.map((c) => ({
          city: c.city,
          country: c.country,
          percentage: total > 0 ? Math.round((c.count / total) * 100) : 0,
        }));
      })(),
      audienceAge: [],
      trafficSources: [],
    },
    featuredPerformanceUrl: dj.featuredPerformanceUrl ?? undefined,
    featuredPerformanceContext: dj.featuredPerformanceContext ?? undefined,
    featuredPerformanceThumbnailUrl,
    availability: {
      timezone: dj.availabilityTimezone ?? "",
      month: dj.availabilityMonth ?? "",
      availableDays:
        (
          dj.availabilityDays as Array<{
            day: number;
            status: string;
          }> | null
        )
          ?.filter((d) => d.status === "available")
          .map((d) => d.day) ?? [],
      bookedDays:
        (
          dj.availabilityDays as Array<{
            day: number;
            status: string;
          }> | null
        )
          ?.filter((d) => d.status === "booked")
          .map((d) => d.day) ?? [],
      tentativeDays:
        (
          dj.availabilityDays as Array<{
            day: number;
            status: string;
          }> | null
        )
          ?.filter((d) => d.status === "tentative")
          .map((d) => d.day) ?? [],
    },
    packages: [], // Fetched client-side via API
    bio: dj.bio ?? "",
    specialties: dj.djTypes.map((t) => t.type),
    media: {
      photos: dj.media.filter((m) => m.type === "IMAGE").map((m) => m.url),
      videos: dj.media
        .filter((m) => m.type === "VIDEO")
        .map((m) => ({
          id: m.id,
          title: m.title ?? "",
          url: m.url,
          thumbnail: m.thumbnail ?? dj.coverImage ?? "/noCover.png",
          duration: m.duration ?? "",
          views: m.viewCount ?? 0,
        })),
      mixes: dj.media
        .filter((m) => m.type === "AUDIO")
        .map((m) => ({
          id: m.id,
          title: m.title ?? "",
          url: m.url,
          thumbnail: m.thumbnail ?? dj.coverImage ?? "/noCover.png",
          duration: m.duration ?? "",
          plays: m.playCount ?? 0,
        })),
    },
    careerHighlights: [], // Fetched client-side via API
    endorsements: [], // Fetched client-side via API
    press: [], // Fetched client-side via API
    venuesPlayed: [], // Fetched client-side via API
    reviewsList: [], // Fetched client-side via pagination API
    team: {
      manager: { name: dj.managerName ?? "", email: dj.managerEmail ?? "" },
      bookingAgent: {
        name: dj.agentName ?? "",
        agency: dj.agentAgency ?? "",
        email: dj.agentEmail ?? "",
      },
    },
    booking: {
      email: djBookingEmail,
      phone: djBookingPhone,
      website: websiteLink,
      feeRange: { min: djFeeMin, max: djFeeMax, currency: djFeeCurrency },
    },
    upcomingEvents: [], // Fetched client-side via API
  };

  const isPremium = djPlan === "PREMIUM";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: dj.stageName,
    description:
      dj.bio ||
      `Professional DJ based in ${dj.city?.name || ""}, ${dj.country?.name || ""}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/djs/${dj.slug}`,
    image: dj.avatar,
    address: {
      "@type": "PostalAddress",
      addressLocality: dj.city?.name,
      addressCountry: dj.country?.name,
    },
    knowsAbout: dj.genres.map((g) => g.genre.name),
    aggregateRating:
      avgRating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: dj._count.ratings,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      <ProfileViewTracker
        djProfileId={dj.id}
        status={dj.status}
        hidden={dj.hidden}
      />
      {isPremium ? (
        <DjProfilePremium
          djData={djDemoData}
          reputationScore={dj.reputationScore}
          reputationDetail={dj.reputationDetail}
          status={dj.status}
        />
      ) : (
        <DjProfileFree
          djData={djDemoData}
          reputationScore={dj.reputationScore}
          reputationDetail={dj.reputationDetail}
        />
      )}
    </div>
  );
}
