import { Suspense } from "react";
import prisma from "@/lib/client";
import { mockDJs, DjUser } from "@/lib/data";
import FilterPanel from "@/components/directory/FilterPanel";
import DjGrid from "@/components/directory/DjGrid";
import EventCalendar from "@/components/directory/EventCalendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";

type SearchParams = {
  genre?: string;
  country?: string;
  sort?: string;
};

const DirectoryPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { genre, country, sort } = await searchParams;

  let djs: DjUser[] = [];
  let fetchError = false;

  try {
    const profiles = await prisma.djProfile.findMany({
      where: {
        deletedAt: null,
        ...(genre
          ? {
              genres: {
                some: {
                  genre: { name: { contains: genre, mode: "insensitive" } },
                },
              },
            }
          : {}),
        ...(country
          ? { country: { name: { contains: country, mode: "insensitive" } } }
          : {}),
      },
      orderBy: sort === "a-z" ? { stageName: "asc" } : { createdAt: "desc" },
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
    fetchError = true;
  }

  const hasFilters = !!(genre || country || sort);
  const displayDjs = hasFilters
    ? djs
    : fetchError
      ? mockDJs
      : djs.length
        ? djs
        : mockDJs;

  let availableGenres: string[] = [];
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    });
    availableGenres = genres.map((g) => g.name);
  } catch {
    availableGenres = [
      ...new Set(
        mockDJs
          .flatMap((dj) => (dj.genres ?? "").split(",").map((g) => g.trim()))
          .filter(Boolean),
      ),
    ].sort();
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 py-10 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="flex flex-col gap-2">
          <h1 className="text-h_white font-bold text-3xl md:text-5xl">
            DJ{" "}
            <span className="text-h_purple">
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
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="flex gap-6 py-6">
          {/* Left — Filters */}
          <div className="hidden xl:block w-[20%] shrink-0">
            <Suspense
              fallback={
                <div className="bg-h_blackLight/50 rounded-xl p-4 h-96 animate-pulse" />
              }
            >
              <FilterPanel genres={availableGenres} />
            </Suspense>
          </div>

          {/* Center — DJ Grid */}
          <div className="w-full xl:w-[55%]">
            <DjGrid djs={displayDjs} />
          </div>

          {/* Right — Events Calendar */}
          <div className="hidden lg:block w-[30%] shrink-0">
            <EventCalendar />
          </div>
        </div>
      </div>
    </>
  );
};

export default DirectoryPage;
