import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublishedGigsForDj } from "@/lib/queries/gigs";
import type { DjGigListItem } from "@/lib/queries/gigs";
import { DjGigCard } from "@/components/gigs/GigCard";
import { GigFilters } from "@/components/gigs/GigFilters";
import {
  GigType,
  ExperienceLevel,
  BudgetType,
  OrganizerType,
} from "@prisma/client";
import { getDemoGigs } from "@/data/gigs-demo";
import { getDemoOrganizerBySlug } from "@/data/organizers";

export const metadata = { title: "Gigs — DJscovery" };

export default async function DjGigMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const sp = await searchParams;

  const countryIdNum = sp.countryId ? Number(sp.countryId) : undefined;
  const cityIdNum = sp.cityId ? Number(sp.cityId) : undefined;
  const gigType =
    sp.type && Object.values(GigType).includes(sp.type as GigType)
      ? (sp.type as GigType)
      : undefined;
  const experienceLevel =
    sp.level &&
    Object.values(ExperienceLevel).includes(sp.level as ExperienceLevel)
      ? (sp.level as ExperienceLevel)
      : undefined;

  const dbGigs = await getPublishedGigsForDj({
    gigType,
    countryId: Number.isInteger(countryIdNum) ? countryIdNum : undefined,
    cityId: Number.isInteger(cityIdNum) ? cityIdNum : undefined,
    experienceLevel,
    search: sp.q,
  });

  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  let gigs: (DjGigListItem & { isDemo?: true })[] = dbGigs;

  if (isStaging) {
    const dbSlugs = new Set(dbGigs.map((g) => g.slug));
    const demoItems = getDemoGigs()
      .filter((g) => {
        if (dbSlugs.has(g.slug)) return false;
        if (gigType && g.gigType !== gigType) return false;
        if (sp.q && !g.title.toLowerCase().includes(sp.q.toLowerCase()))
          return false;
        return true;
      })
      .map((g, i) => {
        const org = getDemoOrganizerBySlug(g.organizerSlug);
        return {
          id: 0,
          isDemo: true as const,
          slug: g.slug,
          title: g.title,
          gigType: g.gigType as GigType,
          description: null,
          status: "PUBLISHED",
          eventDate: g.eventDate,
          applicationDeadline: g.applicationDeadline,
          countryId: null,
          country: g.country ? { id: 0, name: g.country, code: "" } : null,
          cityId: null,
          city: g.city ? { id: 0, name: g.city } : null,
          venueName: null,
          hideVenueName: false,
          budgetType: g.budgetType as BudgetType,
          budgetMin: g.budgetMin,
          budgetMax: g.budgetMax,
          currency: g.currency,
          requiredGenres: g.requiredGenres,
          requiredExperienceLevel: null,
          setDurationMinutes: null,
          guestCount: null,
          dressCode: null,
          mcRequired: false,
          micRequired: false,
          languagesSpoken: [],
          venueProvides: [],
          djMustBring: [],
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          organizerProfile: {
            id: 0,
            displayName: org?.displayName ?? g.organizerSlug,
            slug: g.organizerSlug,
            logoUrl: org?.logoUrl ?? null,
            organizerType: (org?.organizerType ?? "COMPANY") as OrganizerType,
          },
          _count: { applications: g.applicationsCount },
        } as unknown as DjGigListItem;
      });
    gigs = [...dbGigs, ...demoItems];
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Gigs</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {gigs.length === 0
              ? "No gigs available right now."
              : `${gigs.length} gig${gigs.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Filters */}
        <Suspense
          fallback={
            <div className="mb-6 h-10 animate-pulse rounded-lg bg-white/5" />
          }
        >
          <GigFilters />
        </Suspense>

        {/* Empty state */}
        {gigs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-24 text-center">
            <Briefcase className="mb-4 h-10 w-10 text-gray-700" />
            <p className="font-semibold text-white">No gigs available</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Check back soon — new gigs are posted regularly.
            </p>
          </div>
        )}

        {/* Gig grid */}
        {gigs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <DjGigCard key={gig.slug} gig={gig} isDemo={!!gig.isDemo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
