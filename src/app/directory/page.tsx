import { Suspense } from "react";
import prisma from "@/lib/client";
import { DjType } from "@prisma/client";
import { demoDJsAsDjUsers, DjUser } from "@/lib/data";
import FilterPanel from "@/components/directory/FilterPanel";
import FilterBottomSheet from "@/components/directory/FilterBottomSheet";
import DjGrid from "@/components/directory/DjGrid";
import ActiveFilterBadges from "@/components/directory/ActiveFilterBadges";
import EventCalendar from "@/components/directory/EventCalendar";
import { AudioLines, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SearchParams = {
  genre?: string;
  country?: string;
  city?: string;
  sort?: string;
  q?: string;
  djType?: string;
};

export const revalidate = 300; // Cache for 5 minutes

const DirectoryPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { genre, country, city, sort, q, djType } = await searchParams;
  const genreList = genre ? genre.split(",").filter(Boolean) : [];
  const validDjTypes = new Set(Object.values(DjType));
  const djTypeList = (djType ? djType.split(",").filter(Boolean) : []).filter(
    (t): t is DjType => validDjTypes.has(t as DjType),
  );

  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";
  let djs: DjUser[] = [];

  try {
    const profiles = await prisma.djProfile.findMany({
      where: {
        deletedAt: null,
        status: "APPROVED",
        hidden: false,
        ...(q
          ? {
              OR: [
                { stageName: { contains: q, mode: "insensitive" } },
                { country: { name: { contains: q, mode: "insensitive" } } },
                { city: { name: { contains: q, mode: "insensitive" } } },
                {
                  genres: {
                    some: {
                      genre: { name: { contains: q, mode: "insensitive" } },
                    },
                  },
                },
              ],
            }
          : {}),

        ...(genreList.length > 0
          ? {
              genres: {
                some: {
                  genre: { name: { in: genreList } },
                },
              },
            }
          : {}),
        ...(country
          ? { country: { name: { contains: country, mode: "insensitive" } } }
          : {}),
        ...(city
          ? { city: { name: { contains: city, mode: "insensitive" } } }
          : {}),
        ...(djTypeList.length > 0
          ? {
              djTypes: {
                some: { type: { in: djTypeList as DjType[] } },
              },
            }
          : {}),
      },
      orderBy:
        sort === "a-z"
          ? { stageName: "asc" }
          : sort === "z-a"
            ? { stageName: "desc" }
            : sort === "new"
              ? { createdAt: "desc" }
              : sort === "trending"
                ? { monthlyViews: "desc" }
                : [{ searchScore: "desc" }, { reputationScore: "desc" }],
      include: {
        user: true,
        country: { select: { name: true } },
        city: { select: { name: true } },
        genres: { include: { genre: { select: { name: true } } } },
        djTypes: { select: { type: true } },
        gigReviews: { select: { id: true } },
        eventReviews: { select: { id: true } },
        ratings: { select: { id: true } },
        _count: { select: { followers: true } },
      },
    });

    djs = profiles.map((p) => ({
      djProfileId: p.id,
      id: p.userId,
      username: p.user.username,
      stageName: p.stageName,
      avatar: p.avatar,
      genres: p.genres.map((g) => g.genre.name).join(", ") || null,
      country: p.country?.name ?? null,
      city: p.city?.name ?? null,
      slug: p.slug,
      isPremium: p.plan === "PREMIUM",
      isFeatured: p.featured,
      status: p.status,
      djTypes: p.djTypes.map((t) => t.type),
      _count: { followers: p._count.followers },
      reputationScore: p.reputationScore,
      gigReviews: p.gigReviews,
      eventReviews: p.eventReviews,
      ratings: p.ratings,
    }));
  } catch {
    // fetchError
  }

  const demoDjs = demoDJsAsDjUsers();

  const filterDemoDjs = (list: DjUser[]) =>
    list.filter((dj) => {
      const genreOk =
        genreList.length > 0
          ? genreList.some((g) =>
              (dj.genres ?? "").toLowerCase().includes(g.toLowerCase()),
            )
          : true;
      const countryOk = country
        ? (dj.country ?? "").toLowerCase().includes(country.toLowerCase())
        : true;
      const cityOk = city
        ? (dj.city ?? "").toLowerCase().includes(city.toLowerCase())
        : true;
      const qOk = q
        ? [
            dj.stageName ?? dj.username,
            dj.genres ?? "",
            dj.country ?? "",
            dj.city ?? "",
          ].some((field) => field.toLowerCase().includes(q.toLowerCase()))
        : true;
      const djTypeOk =
        djTypeList.length > 0
          ? (dj.djTypes ?? []).some((t) => djTypeList.includes(t as DjType))
          : true;
      return genreOk && countryOk && cityOk && qOk && djTypeOk;
    });

  const sortDjs = (list: DjUser[]) => {
    if (sort === "a-z")
      return [...list].sort((a, b) =>
        (a.stageName ?? a.username).localeCompare(b.stageName ?? b.username),
      );
    if (sort === "z-a")
      return [...list].sort((a, b) =>
        (b.stageName ?? b.username).localeCompare(a.stageName ?? a.username),
      );
    if (sort === "most-followed")
      return [...list].sort(
        (a, b) => (b._count?.followers ?? 0) - (a._count?.followers ?? 0),
      );
    if (sort === "new")
      return [...list].sort((a, b) => {
        // For demo data, use a stable order since they don't have createdAt
        if (!a.djProfileId) return 1;
        if (!b.djProfileId) return -1;
        return b.djProfileId - a.djProfileId;
      });
    if (sort === "trending")
      return [...list].sort((a, b) => {
        // For demo data, use followers as proxy for monthlyViews
        return (b._count?.followers ?? 0) - (a._count?.followers ?? 0);
      });
    if (sort === "top-rated")
      return [...list].sort((a, b) => {
        // Calculate average rating from ratings array
        const avgRatingA =
          a.ratings && a.ratings.length > 0
            ? a.ratings.reduce(
                (sum: number, r: any) => sum + (r.rating || 0),
                0,
              ) / a.ratings.length
            : 0;
        const avgRatingB =
          b.ratings && b.ratings.length > 0
            ? b.ratings.reduce(
                (sum: number, r: any) => sum + (r.rating || 0),
                0,
              ) / b.ratings.length
            : 0;
        return avgRatingB - avgRatingA;
      });
    return list;
  };

  // NOTE: followedDjIds is fetched client-side (see DjGrid -> useFollowedDjIds)
  // so this page can stay a static, ISR-cached shell with no auth/cookie reads.
  const filteredDemoDjs = filterDemoDjs(demoDjs);
  const dbIds = new Set(djs.map((d) => d.id));
  const displayDjs = sortDjs(
    isStaging
      ? [...djs, ...filteredDemoDjs.filter((d) => !dbIds.has(d.id))]
      : djs,
  );

  let availableGenres: string[] = [];

  try {
    const genres = await prisma.genre.findMany({
      where: {
        djGenres: {
          some: {
            djProfile: {
              deletedAt: null,
              status: "APPROVED",
              hidden: false,
              ...(country
                ? {
                    country: {
                      name: { contains: country, mode: "insensitive" },
                    },
                  }
                : {}),
              ...(city
                ? { city: { name: { contains: city, mode: "insensitive" } } }
                : {}),
              ...(djTypeList.length > 0
                ? {
                    djTypes: {
                      some: { type: { in: djTypeList as DjType[] } },
                    },
                  }
                : {}),
            },
          },
        },
      },
      orderBy: { name: "asc" },
      select: { name: true },
    });
    availableGenres = genres.map((g) => g.name);
  } catch {
    // ignore
  }
  if (isStaging) {
    const demoForGenres = demoDjs.filter((dj) => {
      const countryOk = country
        ? (dj.country ?? "").toLowerCase().includes(country.toLowerCase())
        : true;
      const cityOk = city
        ? (dj.city ?? "").toLowerCase().includes(city.toLowerCase())
        : true;
      const djTypeOk =
        djTypeList.length > 0
          ? (dj.djTypes ?? []).some((t) => djTypeList.includes(t as DjType))
          : true;
      return countryOk && cityOk && djTypeOk;
    });
    const demoGenres = demoForGenres
      .flatMap((dj) => (dj.genres ?? "").split(",").map((g) => g.trim()))
      .filter(Boolean);
    availableGenres = [...new Set([...availableGenres, ...demoGenres])].sort();
  }

  let availableCountries: string[] = [];
  let countryCities: Record<string, string[]> = {};

  try {
    const countryWhere = {
      deletedAt: null as null,
      status: "APPROVED" as const,
      hidden: false,
      ...(genreList.length > 0
        ? { genres: { some: { genre: { name: { in: genreList } } } } }
        : {}),
      ...(djTypeList.length > 0
        ? { djTypes: { some: { type: { in: djTypeList as DjType[] } } } }
        : {}),
    };
    const countryData = await prisma.country.findMany({
      where: { djProfiles: { some: countryWhere } },
      orderBy: { name: "asc" },
      select: {
        name: true,
        cities: {
          where: { djProfiles: { some: countryWhere } },
          orderBy: { name: "asc" },
          select: { name: true },
        },
      },
    });
    availableCountries = countryData.map((c) => c.name);
    for (const c of countryData) {
      countryCities[c.name] = c.cities.map((ci) => ci.name);
    }
  } catch {
    // ignore
  }
  if (isStaging) {
    const demoForCountries = demoDjs.filter((dj) => {
      const genreOk =
        genreList.length > 0
          ? genreList.some((g) =>
              (dj.genres ?? "").toLowerCase().includes(g.toLowerCase()),
            )
          : true;
      const djTypeOk =
        djTypeList.length > 0
          ? (dj.djTypes ?? []).some((t) => djTypeList.includes(t as DjType))
          : true;
      return genreOk && djTypeOk;
    });
    for (const dj of demoForCountries) {
      if (dj.country && !availableCountries.includes(dj.country))
        availableCountries.push(dj.country);
      if (dj.country && dj.city) {
        if (!countryCities[dj.country]) countryCities[dj.country] = [];
        if (!countryCities[dj.country].includes(dj.city))
          countryCities[dj.country].push(dj.city);
      }
    }
    availableCountries.sort();
    for (const c in countryCities) countryCities[c].sort();
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <AudioLines className="text-h_red h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                DJ <span className="text-h_red/80">Directory</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-400">
                Browse and discover talented DJs from around the world.
              </p>
            </div>
          </div>
          {/* Right — community stat badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-h_red/10 text-h_red border-h_red/20 gap-1.5 border px-3 py-1">
              <Headphones className="h-3 w-3" /> {displayDjs.length} DJ
              {displayDjs.length !== 1 ? "s" : ""} listed
            </Badge>
          </div>
        </div>
      </section>

      {/* 3-Column Layout */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-6 py-6 xl:flex-row">
          {/* Left — Filters (desktop sidebar only) */}
          <div className="hidden xl:block xl:w-[20%] xl:shrink-0">
            <Suspense
              fallback={
                <div className="bg-h_blackLight/50 h-96 animate-pulse rounded-xl p-4" />
              }
            >
              <FilterPanel
                genres={availableGenres}
                availableCountries={availableCountries}
                countryCities={countryCities}
              />
            </Suspense>
          </div>

          {/* Center — DJ Grid */}
          <div className="w-full">
            {/* Mobile filter trigger (hidden on xl+) */}
            <Suspense fallback={null}>
              <FilterBottomSheet
                genres={availableGenres}
                availableCountries={availableCountries}
                countryCities={countryCities}
              />
            </Suspense>
            <Suspense fallback={null}>
              <ActiveFilterBadges />
            </Suspense>
            <DjGrid djs={displayDjs} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DirectoryPage;
