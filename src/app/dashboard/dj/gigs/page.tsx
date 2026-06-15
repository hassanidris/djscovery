import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublishedGigsForDj } from "@/lib/queries/gigs";
import { DjGigCard } from "@/components/gigs/GigCard";
import { GigFilters } from "@/components/gigs/GigFilters";
import type { GigType, ExperienceLevel } from "@prisma/client";

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

  const gigs = await getPublishedGigsForDj({
    gigType: sp.type as GigType | undefined,
    countryId: sp.countryId ? parseInt(sp.countryId, 10) : undefined,
    cityId: sp.cityId ? parseInt(sp.cityId, 10) : undefined,
    experienceLevel: sp.level as ExperienceLevel | undefined,
    search: sp.q,
  });

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
              <DjGigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
