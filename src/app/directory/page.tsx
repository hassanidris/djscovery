import { Suspense } from "react";
import prisma from "@/lib/client";
import { demoDJsAsDjUsers, DjUser } from "@/lib/data";
import FilterPanel from "@/components/directory/FilterPanel";
import DjGrid from "@/components/directory/DjGrid";
import ActiveFilterBadges from "@/components/directory/ActiveFilterBadges";
import EventCalendar from "@/components/directory/EventCalendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";

type SearchParams = {
  genre?: string;
  country?: string;
  city?: string;
  sort?: string;
  q?: string;
};

const DirectoryPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { genre, country, city, sort, q } = await searchParams;
  const genreList = genre ? genre.split(",").filter(Boolean) : [];

  let djs: DjUser[] = [];

  try {
    const profiles = await prisma.djProfile.findMany({
      where: {
        deletedAt: null,
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
      },
      orderBy:
        sort === "a-z"
          ? { stageName: "asc" }
          : sort === "z-a"
            ? { stageName: "desc" }
            : { createdAt: "desc" },
      include: {
        user: {
          include: { _count: { select: { followers: true } } },
        },
        country: { select: { name: true } },
        city: { select: { name: true } },
        genres: { include: { genre: { select: { name: true } } } },
      },
    });

    djs = profiles.map((p) => ({
      id: p.userId,
      username: p.user.username,
      stageName: p.stageName,
      avatar: p.avatar,
      genres: p.genres.map((g) => g.genre.name).join(", ") || null,
      country: p.country?.name ?? null,
      city: p.city?.name ?? null,
      _count: { followers: p.user._count.followers },
    }));
  } catch {
    // fetchError: fallback to demoDjs via djs.length check below
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
      return genreOk && countryOk && cityOk && qOk;
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
    return list;
  };

  const isStaging = process.env.NEXT_PUBLIC_APP_ENV !== "production";
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
          some: { djProfile: { deletedAt: null } },
        },
      },
      orderBy: { name: "asc" },
      select: { name: true },
    });
    availableGenres = genres.map((g) => g.name);
  } catch {
    // ignore — handled below
  }

  if (isStaging) {
    const demoGenreList = [
      ...new Set(
        demoDjs
          .flatMap((dj) => (dj.genres ?? "").split(",").map((g) => g.trim()))
          .filter(Boolean),
      ),
    ];
    availableGenres = [
      ...new Set([...availableGenres, ...demoGenreList]),
    ].sort();
  }

  let availableCountries: string[] = [];
  let countryCities: Record<string, string[]> = {};

  try {
    const countryData = await prisma.country.findMany({
      where: { djProfiles: { some: { deletedAt: null } } },
      orderBy: { name: "asc" },
      select: {
        name: true,
        cities: {
          where: { djProfiles: { some: { deletedAt: null } } },
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
    for (const dj of demoDjs) {
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
      <section className="bg-h_blackLight/30 border-b border-gray-800 py-10 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="flex flex-col gap-2 max-w-7xl w-full mx-auto px-4 md:px-8">
          <h1 className="text-h_white font-bold text-3xl md:text-5xl">
            DJ{" "}
            <span className="text-h_red/80">
              Directory{" "}
              <FontAwesomeIcon
                icon={faHeadphones}
                className="w-8 h-8 md:w-10 md:h-10 inline"
              />
            </span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Browse and discover talented DJs from around the world.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {displayDjs.length} DJ{displayDjs.length !== 1 ? "s" : ""} listed
          </p>
        </div>
      </section>

      {/* 3-Column Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <div className="flex flex-col xl:flex-row gap-6 py-6">
          {/* Left — Filters */}
          <div className=" xl:block xl:w-[20%] shrink-0">
            <Suspense
              fallback={
                <div className="bg-h_blackLight/50 rounded-xl p-4 h-96 animate-pulse " />
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
