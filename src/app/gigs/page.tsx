import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublishedGigsForDj } from "@/lib/queries/gigs";
import { getDemoGigs } from "@/data/gigs-demo";
import type { DjGigListItem } from "@/lib/queries/gigs";
import { GigGrid } from "@/components/gigs/GigGrid";
import { GigFilters } from "@/components/gigs/GigFilters";
import { GigGridSkeleton } from "@/components/gigs/GigSkeleton";

export const metadata = { title: "Gigs — DJcovery" };
export const revalidate = 60;

// ── Gigs Content Component (async for Suspense) ─────────────────────────────

async function GigsContent({
  typeFilter,
  searchQuery,
}: {
  typeFilter: string;
  searchQuery: string;
}) {
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  let dbGigs: DjGigListItem[] = [];
  try {
    dbGigs = await getPublishedGigsForDj({
      latestFirst: true,
    });
  } catch {
    // DB unavailable — fall through to demo data
  }

  const demoGigsAll: (DjGigListItem & { isDemo: true })[] = getDemoGigs().map(
    (g) =>
      ({
        id: Number(g.id),
        slug: g.slug,
        title: g.title,
        gigType: g.gigType as any,
        description: null,
        status: "OPEN" as any,
        eventDate: g.eventDate,
        applicationDeadline: null,
        budgetType: g.budgetType as any,
        budgetMin: g.budgetMin,
        budgetMax: g.budgetMax,
        currency: g.currency,
        requiredGenres: g.requiredGenres,
        djMustBring: [],
        cityId: null,
        city: { name: g.city } as any,
        countryId: null,
        country: { name: g.country } as any,
        organizerProfileId: 0,
        organizerProfile: {
          displayName: g.organizerSlug,
          slug: g.organizerSlug,
          logoUrl: null,
        } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        venueName: null,
        hideVenueName: false,
        requiredExperienceLevel: null,
        setDurationMinutes: null,
        setBreakMinutes: null,
        numberOfSets: null,
        equipmentProvided: [],
        additionalInfo: null,
        guestCount: null,
        dressCode: null,
        mcRequired: false,
        micRequired: false,
        _count: { applications: g.applicationsCount },
        isDemo: true,
      }) as unknown as DjGigListItem & { isDemo: true },
  );

  const dbSlugs = new Set(dbGigs.map((g) => g.slug));
  const allGigs = isStaging
    ? [...dbGigs, ...demoGigsAll.filter((g) => !dbSlugs.has(g.slug))]
    : dbGigs.length > 0
      ? dbGigs
      : demoGigsAll;

  // Apply filters
  const filteredGigs = allGigs.filter((gig) => {
    // Type filter
    if (typeFilter && gig.gigType !== typeFilter) return false;

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = gig.title.toLowerCase().includes(query);
      const genreMatch = gig.requiredGenres.some((g) =>
        g.toLowerCase().includes(query),
      );
      const locationMatch =
        gig.city?.name?.toLowerCase().includes(query) ||
        gig.country?.name?.toLowerCase().includes(query);
      if (!titleMatch && !genreMatch && !locationMatch) return false;
    }

    return true;
  });

  const gigs = filteredGigs;

  return (
    <>
      {gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-24 text-center">
          <Briefcase className="mb-4 h-10 w-10 text-zinc-700" />
          <p className="font-semibold text-white">No gigs available</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Check back later for new opportunities
          </p>
        </div>
      ) : (
        <GigGrid gigs={gigs} />
      )}
    </>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Normalize query parameters to handle string arrays
  const normalizeParam = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
  };

  const typeFilter = normalizeParam(sp.type);
  const searchQuery = normalizeParam(sp.q);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <section className="bg-h_blackLight/30 border-b border-gray-800 px-4 py-10 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-h_red/10 border-h_red/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
              <Briefcase className="text-h_red h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h_white text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Open <span className="text-h_red/80">Gigs</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-400">
                Browse all available gig opportunities from organizers looking
                to hire DJs
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Filters */}
        <div className="mb-8 flex justify-end">
          <Suspense
            fallback={
              <div className="h-10 w-32 animate-pulse rounded bg-zinc-800" />
            }
          >
            <GigFilters />
          </Suspense>
        </div>

        {/* Gigs Content with Suspense for loading state */}
        <Suspense fallback={<GigGridSkeleton />}>
          <GigsContent typeFilter={typeFilter} searchQuery={searchQuery} />
        </Suspense>
      </div>
    </div>
  );
}
