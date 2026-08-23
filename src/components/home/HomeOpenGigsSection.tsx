import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { getPublishedGigsForDj } from "@/lib/queries/gigs";
import { getDemoGigs } from "@/data/gigs-demo";
import { getDemoOrganizerBySlug } from "@/data/organizers";
import { GIG_TYPE_FIELDS } from "@/config/gig-type-fields";
import type { GigType } from "@prisma/client";
import { formatDateWithWeekday } from "@/lib/utils/date";

type HomeGigItem = {
  id: string;
  slug: string;
  dbId?: number;
  title: string;
  gigTypeLabel: string;
  city: string;
  country: string;
  budgetType: "FIXED" | "RANGE" | "NEGOTIABLE" | "TBA";
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  requiredGenres: string[];
  eventDate: Date;
  applicationsCount: number;
  isDemo: boolean;
  organizer: {
    displayName: string;
    slug: string;
    logoUrl: string | null;
  };
};

function formatBudget(
  budgetType: string,
  budgetMin: number | null,
  budgetMax: number | null,
  currency: string,
): string {
  if (budgetType === "NEGOTIABLE") return "Negotiable";
  if (budgetType === "TBA") return "Budget TBA";
  if (budgetType === "FIXED" && budgetMin != null)
    return `${currency} ${budgetMin.toLocaleString()}`;
  if (budgetType === "RANGE" && budgetMin != null && budgetMax != null)
    return `${currency} ${budgetMin.toLocaleString()} – ${budgetMax.toLocaleString()}`;
  return "Budget TBA";
}

function formatEventDate(date: Date): string {
  return formatDateWithWeekday(date);
}

export default async function HomeOpenGigsSection({
  isDj,
  countryId,
  countryName,
}: {
  isDj: boolean;
  countryId: number | null;
  countryName: string | null;
}) {
  if (!isDj) return null;

  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

  let dbGigs: HomeGigItem[] = [];
  try {
    const rows = await getPublishedGigsForDj({
      latestFirst: true,
      ...(countryId ? { countryId } : {}),
    });
    dbGigs = rows.slice(0, 4).map((g) => ({
      id: String(g.id),
      slug: g.slug,
      dbId: g.id,
      title: g.title,
      gigTypeLabel: GIG_TYPE_FIELDS[g.gigType]?.label ?? g.gigType,
      city: g.city?.name ?? "",
      country: g.country?.name ?? "",
      budgetType: g.budgetType as HomeGigItem["budgetType"],
      budgetMin: g.budgetMin,
      budgetMax: g.budgetMax,
      currency: g.currency,
      requiredGenres: g.requiredGenres,
      eventDate: g.eventDate,
      applicationsCount: g._count.applications,
      isDemo: false,
      organizer: {
        displayName: g.organizerProfile.displayName,
        slug: g.organizerProfile.slug,
        logoUrl: g.organizerProfile.logoUrl ?? null,
      },
    }));
  } catch {
    // DB unavailable — fall through to demo data
  }

  const demoGigsAll: HomeGigItem[] = getDemoGigs().map((g) => {
    const org = getDemoOrganizerBySlug(g.organizerSlug);
    return {
      id: g.id,
      slug: g.slug,
      title: g.title,
      gigTypeLabel: GIG_TYPE_FIELDS[g.gigType as GigType]?.label ?? g.gigType,
      city: g.city,
      country: g.country,
      budgetType: g.budgetType,
      budgetMin: g.budgetMin,
      budgetMax: g.budgetMax,
      currency: g.currency,
      requiredGenres: g.requiredGenres,
      eventDate: g.eventDate,
      applicationsCount: g.applicationsCount,
      isDemo: true,
      organizer: {
        displayName: org?.displayName ?? g.organizerSlug,
        slug: g.organizerSlug,
        logoUrl: org?.logoUrl ?? null,
      },
    };
  });

  const demoGigs = countryName
    ? demoGigsAll.filter(
        (g) => g.country.toLowerCase() === countryName.toLowerCase(),
      )
    : demoGigsAll;

  const dbSlugs = new Set(dbGigs.map((g) => g.slug));
  const gigs = isStaging
    ? [...dbGigs, ...demoGigs.filter((g) => !dbSlugs.has(g.slug))].slice(0, 4)
    : dbGigs.length > 0
      ? dbGigs.slice(0, 4)
      : demoGigs.slice(0, 4);

  if (gigs.length === 0) return null;

  return (
    <section className="border-t border-white/5 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Open Gigs
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              Organizers looking to hire right now
            </p>
          </div>
          <Link
            href="/gigs"
            className="text-h_redLight hover:text-h_redLight/80 text-sm font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {gigs.map((gig) => {
            const budgetLabel = formatBudget(
              gig.budgetType,
              gig.budgetMin,
              gig.budgetMax,
              gig.currency,
            );
            const applyHref = `/gigs/${gig.slug}`;

            return (
              <Link
                key={gig.id}
                href={applyHref}
                className="group hover:ring-h_red flex flex-col gap-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/10 transition-all sm:flex-row sm:items-start"
              >
                {/* LEFT — what is the gig */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="self-start rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                    {gig.gigTypeLabel}
                  </span>
                  <p className="leading-snug font-semibold text-white">
                    {gig.title}
                  </p>
                  {gig.requiredGenres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {gig.requiredGenres.slice(0, 3).map((g) => (
                        <Badge
                          key={g}
                          className="bg-h_redDark/60 border-0 text-red-300"
                        >
                          {g}
                        </Badge>
                      ))}
                      {gig.requiredGenres.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{gig.requiredGenres.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider — mobile only */}
                <div className="border-t border-white/8 sm:hidden" />

                {/* RIGHT — budget + who / where / when */}
                <div className="flex shrink-0 flex-col gap-1.5 sm:items-end sm:text-right">
                  <p className="text-base font-bold text-white">
                    {budgetLabel}
                  </p>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 sm:justify-end">
                    {gig.organizer.logoUrl ? (
                      <span className="relative inline-block h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={gig.organizer.logoUrl}
                          alt={gig.organizer.displayName}
                          fill
                          className="object-cover"
                          sizes="14px"
                        />
                      </span>
                    ) : (
                      <span className="text-[10px]">🏢</span>
                    )}
                    {gig.organizer.displayName}
                  </span>
                  {(gig.city || gig.country) && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 sm:justify-end">
                      <MapPin className="h-3 w-3" />
                      {[gig.city, gig.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-400 sm:justify-end">
                    <CalendarDays className="h-3 w-3" />
                    {formatEventDate(gig.eventDate)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400 sm:justify-end">
                    <Users className="h-3 w-3" />
                    {gig.applicationsCount} applied
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
