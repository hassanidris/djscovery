import { Suspense } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getPublishedGigsForDj } from "@/lib/queries/gigs";
import type { DjGigListItem } from "@/lib/queries/gigs";
import { GigGrid } from "@/components/gigs/GigGrid";
import { GigFilters } from "@/components/gigs/GigFilters";
import {
  GigType,
  ExperienceLevel,
  BudgetType,
  OrganizerType,
} from "@prisma/client";
import { getDemoGigs } from "@/data/gigs-demo";
import { getDemoOrganizerBySlug } from "@/data/organizers";

export const metadata = { title: "Gigs — DJcovery" };

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
      {/* Hero Banner */}
      <section className="w-full">
        {/* Cover image + gradient overlays */}
        <div className="relative h-52 w-full overflow-hidden md:h-72">
          <Image
            src="/cover-hero.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />
          <div className="from-h_red/8 absolute inset-0 bg-linear-to-r to-transparent" />
        </div>

        {/* Title row — outside image, pulled up with negative margin to overlap */}
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="-mt-14 flex flex-col gap-3 pb-6 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-h_red/10 border-h_red/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                <Briefcase className="text-h_red h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
                  Open <span className="text-h_red/80">Gigs</span>
                </h1>
                <p className="text-sm leading-relaxed text-gray-400">
                  Browse available gigs and find your next booking.
                </p>
              </div>
            </div>
            <Badge className="bg-h_red/10 text-h_red border-h_red/20 w-fit shrink-0 gap-1.5 border px-3 py-1">
              <Briefcase className="h-3 w-3" /> {gigs.length} gig
              {gigs.length !== 1 ? "s" : ""} available
            </Badge>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
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

        {/* Gig grid with load-more */}
        {gigs.length > 0 && <GigGrid gigs={gigs} />}
      </div>
    </div>
  );
}
