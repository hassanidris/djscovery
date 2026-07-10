import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import DjProfileFree from "@/components/dj-profile/DjProfileFree";
import DjProfilePremium from "@/components/dj-profile/DjProfilePremium";
import { ProfileViewTracker } from "@/components/dj-profile/ProfileViewTracker";
import { isFollowingDj } from "@/lib/actions/follows";
import { getDemodjBySlug } from "@/data/djs";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import type { BookingFormOptions, BookingViewerContext } from "@/types/booking";
import { getCitiesForCountry, getVenuesForCity } from "@/lib/actions/locations";
import { fetchYouTubeOEmbed } from "@/lib/actions/media";
import JsonLd from "@/components/seo/JsonLd";

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
  const dj = await prisma.djProfile.findUnique({
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
      managerName: true,
      managerEmail: true,
      managerPhone: true,
      agentName: true,
      agentAgency: true,
      agentEmail: true,
      availabilityTimezone: true,
      availabilityMonth: true,
      availabilityDays: true,
      featuredPerformanceUrl: true,
      featuredPerformanceContext: true,
      monthlyViews: true,
      reputationScore: true,
      user: {
        select: {
          id: true,
        },
      },
      country: true,
      genres: { include: { genre: true } },
      djTypes: true,
      socialLinks: true,
      ratings: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true, image: true, name: true } },
        },
      },
      media: {
        take: 50,
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
      },
      packages: true,
      highlights: true,
      endorsements: true,
      pressItems: true,
      eventsOwned: {
        where: { status: { in: ["PUBLISHED", "COMPLETED"] }, deletedAt: null },
        take: 15,
        orderBy: { startDate: "asc" },
        include: { city: true, country: true },
      },
      venues: {
        orderBy: { createdAt: "desc" },
        include: { city: true, country: true },
      },
      reputationDetail: true,
      _count: {
        select: { ratings: true, followers: true },
      },
    },
  });

  if (!dj || dj.status === "REJECTED") return notFound();

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (dj.status === "PENDING_APPROVAL" && authUser?.id !== dj.userId)
    return notFound();

  if (dj.hidden && authUser?.id !== dj.userId) return notFound();

  // Profile view tracking moved to client-side to avoid firing during prefetch/re-renders

  // Accurate aggregates: avg rating over ALL ratings (not just the fetched 20),
  // and event count limited to publicly visible events (matches the list shown).
  const [ratingAgg, publicEventsCount] = await Promise.all([
    prisma.djRating.aggregate({
      where: { djProfileId: dj.id },
      _avg: { rating: true },
    }),
    prisma.event.count({
      where: {
        ownerDjId: dj.id,
        status: { in: ["PUBLISHED", "COMPLETED"] },
        deletedAt: null,
      },
    }),
  ]);
  const avgRating = ratingAgg._avg.rating ?? 0;

  // Fetch YouTube oEmbed thumbnail server-side for Featured Performance
  let featuredPerformanceThumbnailUrl: string | undefined;
  if (
    dj.featuredPerformanceUrl &&
    process.env.NEXT_PUBLIC_APP_ENV === "production"
  ) {
    const oEmbed = await fetchYouTubeOEmbed(dj.featuredPerformanceUrl);
    if ("thumbnailUrl" in oEmbed && oEmbed.thumbnailUrl) {
      featuredPerformanceThumbnailUrl = oEmbed.thumbnailUrl;
    }
  }

  const viewMode: ViewMode = authUser?.id === dj.userId ? "dj-owner" : "fan";
  const isFollowedDj = viewMode === "fan" ? await isFollowingDj(dj.id) : false;

  let viewerContext: BookingViewerContext = {
    role: "guest",
    isAuthenticated: false,
  };

  let bookingOptions: BookingFormOptions = {
    countries: await prisma.country.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  };

  if (authUser) {
    const [roleRows, organizerProfile] = await Promise.all([
      prisma.userRole.findMany({
        where: { userId: authUser.id },
        select: { role: true },
      }),
      prisma.organizerProfile.findUnique({
        where: { userId: authUser.id },
        select: {
          displayName: true,
          contactEmail: true,
          countryId: true,
          cityId: true,
          city: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const roleSet = new Set(roleRows.map((r) => r.role));
    let bookingRole: BookingViewerContext["role"] = "fan";
    if (authUser.id === dj.userId) bookingRole = "dj-owner";
    else if (roleSet.has("ADMIN")) bookingRole = "admin";
    else if (roleSet.has("ORGANIZER")) bookingRole = "organizer";

    viewerContext = {
      role: bookingRole,
      isAuthenticated: true,
      organizerDisplayName: organizerProfile?.displayName ?? undefined,
      organizerContactEmail: organizerProfile?.contactEmail ?? undefined,
      organizerCityId: organizerProfile?.cityId ?? undefined,
      organizerCityName: organizerProfile?.city?.name ?? undefined,
    };

    if (organizerProfile?.countryId && organizerProfile?.cityId) {
      const [initialCities, initialVenues] = await Promise.all([
        getCitiesForCountry(organizerProfile.countryId),
        getVenuesForCity(organizerProfile.cityId),
      ]);

      bookingOptions = {
        ...bookingOptions,
        initialCities,
        initialVenues,
        defaultCountryId: organizerProfile.countryId,
        defaultCityId: organizerProfile.cityId,
      };
    } else if (dj.countryId && dj.cityId) {
      // Fallback to DJ's location if organizer has no location
      const [initialCities, initialVenues] = await Promise.all([
        getCitiesForCountry(dj.countryId),
        getVenuesForCity(dj.cityId),
      ]);

      bookingOptions = {
        ...bookingOptions,
        initialCities,
        initialVenues,
        defaultCountryId: dj.countryId,
        defaultCityId: dj.cityId,
      };
    }
  }

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
      responseRate: 0,
      bookingRate: 0,
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
      profileViews: { value: dj.monthlyViews ?? 0, growth: 0 },
      bookingRequests: { value: 0, growth: 0 },
      newFollowers: { value: 0, growth: 0 },
      bookingRate: 0,
      topCities: [],
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
    packages: dj.packages.map((p) => ({
      id: p.id,
      name: p.name,
      priceFrom: p.priceFrom,
      priceTo: p.priceTo ?? undefined,
      currency: p.currency,
      duration: p.duration ?? undefined,
      features: p.features,
      popular: p.popular,
      sortOrder: p.sortOrder,
    })),
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
    careerHighlights: dj.highlights.map((h) => ({
      title: h.title,
      year: parseInt(h.year, 10),
    })),
    endorsements: dj.endorsements.map((e) => ({
      name: e.name,
      role: e.role,
      company: e.company ?? "",
      quote: e.quote,
    })),
    press: dj.pressItems.map((p) => ({
      source: p.source,
      type: p.type,
      title: p.title,
      date: p.date ?? "",
    })),
    venuesPlayed: (dj.venues || []).map((v) => ({
      id: v.id,
      venue: v.venueName,
      city: v.city?.name ?? "",
      country: v.country?.name ?? "",
      date: v.eventDate ?? "",
      description: v.description ?? "",
    })),
    reviewsList: dj.ratings.map((r) => ({
      name: r.user.name ?? r.user.username,
      rating: r.rating,
      date: r.createdAt.toISOString().split("T")[0],
      comment: r.review ?? "",
    })),
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
    upcomingEvents: dj.eventsOwned.map((e) => {
      const eventDate = new Date(e.startDate);
      const isPast = eventDate < new Date() || e.status === "COMPLETED";
      return {
        title: e.title,
        venue: e.venue ?? "",
        city: e.city?.name ?? "",
        country: e.country?.name ?? "",
        date: e.startDate.toISOString().split("T")[0],
        slug: e.slug,
        eventType: e.eventType,
        category: e.category,
        isPast,
      };
    }),
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
      {dj.status === "PENDING_APPROVAL" && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-400">
          ⏳ Your profile is pending admin approval and is only visible to you.
        </div>
      )}
      {isPremium ? (
        <DjProfilePremium
          djData={djDemoData}
          viewMode={viewMode}
          isFollowed={isFollowedDj}
          reputationScore={dj.reputationScore}
          reputationDetail={dj.reputationDetail}
          status={dj.status}
          viewerContext={viewerContext}
          bookingOptions={bookingOptions}
          countries={bookingOptions.countries}
        />
      ) : (
        <DjProfileFree
          djData={djDemoData}
          viewMode={viewMode}
          isFollowed={isFollowedDj}
          reputationScore={dj.reputationScore}
          reputationDetail={dj.reputationDetail}
          viewerContext={viewerContext}
          bookingOptions={bookingOptions}
        />
      )}
    </div>
  );
}
