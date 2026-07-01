import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import DjProfileFree from "@/components/dj-profile/DjProfileFree";
import DjProfilePremium from "@/components/dj-profile/DjProfilePremium";
import { isFollowingDj } from "@/lib/actions/saves";
import { isFollowing } from "@/lib/actions";
import { getDemodjBySlug } from "@/data/djs";
import type { DjDemoData, ViewMode } from "@/types/dj-demo";
import type { BookingFormOptions, BookingViewerContext } from "@/types/booking";
import { getCitiesForCountry, getVenuesForCity } from "@/lib/actions/locations";

export default async function DjProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "demo-free") {
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
        <DjProfilePremium />
      </div>
    );
  }

  // ── JSON demo data lookup (dev/staging) ─────────────────────────────────
  const demoDj = getDemodjBySlug(slug);
  if (demoDj) {
    if (demoDj.plan === "free") {
      return <DjProfileFree djData={demoDj} viewMode="fan" />;
    }
    return (
      <DjProfilePremium djData={demoDj} viewMode="fan" status="APPROVED" />
    );
  }

  // ── Prisma DB lookup (production) ─────────────────────────────────────────
  const dj = await prisma.djProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
        },
      },
      city: true,
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
        where: { type: "IMAGE" },
        take: 24,
        orderBy: { createdAt: "desc" },
      },
      eventsOwned: {
        where: { status: { in: ["PUBLISHED", "COMPLETED"] }, deletedAt: null },
        take: 15,
        orderBy: { startDate: "asc" },
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

  const viewMode: ViewMode = authUser?.id === dj.userId ? "dj-owner" : "fan";
  const [isFollowedDj, followingDj] =
    viewMode === "fan"
      ? await Promise.all([isFollowingDj(dj.id), isFollowing(dj.userId)])
      : [false, false];

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
    verified: djVerified,
    featured: djFeatured,
    name: dj.stageName,
    stageName: dj.stageName,
    location: {
      city: dj.city?.name ?? "",
      country: dj.country?.name ?? "",
    },
    avatar: {
      url: dj.avatar ?? "/noAvatar.png",
      alt: dj.stageName,
    },
    coverImage: {
      url: dj.coverImage ?? "/noCover.png",
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
      monthlyViews: 0,
    },
    spotlight: {
      featuredMix: {
        title: "",
        duration: "",
        plays: 0,
        genres: [],
        audioUrl: "",
        coverImage: dj.coverImage ?? "/noCover.png",
      },
      featuredVideo: {
        title: "",
        subtitle: "",
        duration: "",
        views: 0,
        thumbnail: dj.coverImage ?? "/noCover.png",
        videoUrl: "",
      },
    },
    analytics: {
      profileViews: { value: 0, growth: 0 },
      bookingRequests: { value: 0, growth: 0 },
      newFollowers: { value: 0, growth: 0 },
      bookingRate: 0,
      topCities: [],
      audienceAge: [],
      trafficSources: [],
    },
    availability: {
      timezone: "",
      month: "",
      availableDays: [],
      bookedDays: [],
      tentativeDays: [],
    },
    packages: [],
    bio: dj.bio ?? "",
    specialties: dj.djTypes.map((t) => t.type),
    media: {
      photos: dj.media.map((m) => m.url),
      videos: [],
      mixes: [],
    },
    careerHighlights: [],
    endorsements: [],
    press: [],
    venuesPlayed: dj.eventsOwned.map((e) => ({
      venue: e.venue ?? e.title,
      city: e.city?.name ?? "",
      timesPlayed: 1,
    })),
    reviewsList: dj.ratings.map((r) => ({
      name: r.user.name ?? r.user.username,
      rating: r.rating,
      date: r.createdAt.toISOString().split("T")[0],
      comment: r.review ?? "",
    })),
    team: {
      manager: { name: "", email: "" },
      bookingAgent: { name: "", agency: "", email: "" },
    },
    booking: {
      email: djBookingEmail,
      phone: djBookingPhone,
      website: websiteLink,
      feeRange: { min: djFeeMin, max: djFeeMax, currency: djFeeCurrency },
    },
    upcomingEvents: dj.eventsOwned.map((e) => ({
      title: e.title,
      venue: e.venue ?? "",
      city: e.city?.name ?? "",
      date: e.startDate.toISOString().split("T")[0],
      slug: e.slug,
      isPast: e.status === "COMPLETED",
    })),
  };

  const isPremium = djPlan === "PREMIUM";

  return (
    <div>
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
          djUserId={dj.userId}
          isFollowing={followingDj}
          reputationScore={dj.reputationScore}
          reputationDetail={dj.reputationDetail}
          status={dj.status}
          viewerContext={viewerContext}
          bookingOptions={bookingOptions}
        />
      ) : (
        <DjProfileFree
          djData={djDemoData}
          viewMode={viewMode}
          isFollowed={isFollowedDj}
          djUserId={dj.userId}
          isFollowing={followingDj}
          reputationScore={dj.reputationScore}
          reputationDetail={dj.reputationDetail}
          viewerContext={viewerContext}
          bookingOptions={bookingOptions}
        />
      )}
    </div>
  );
}
