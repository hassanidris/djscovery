import Link from "next/link";
import Image from "next/image";
import { MapPin, CalendarDays, Users } from "lucide-react";
import { GigStatusBadge } from "@/components/gigs/GigStatusBadge";
import { GIG_TYPE_FIELDS } from "@/config/gig-type-fields";
import type { OrganizerGigListItem } from "@/lib/queries/gigs";
import type { DjGigListItem } from "@/lib/queries/gigs";
import type { BudgetType } from "@prisma/client";

// ─── Budget formatter ─────────────────────────────────────────────────────────

function formatBudget(
  budgetType: BudgetType,
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

// ─── Date formatter ───────────────────────────────────────────────────────────

function formatEventDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================
// ORGANIZER GIG CARD
// Used in /dashboard/organizer/gigs list.
// ============================================================

export function OrganizerGigCard({ gig }: { gig: OrganizerGigListItem }) {
  const typeLabel = GIG_TYPE_FIELDS[gig.gigType].label;
  const location = [gig.city?.name, gig.country?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:border-white/20 hover:bg-white/8 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/organizer/gigs/${gig.id}`}
            className="truncate font-semibold text-white transition-colors group-hover:text-white/90"
          >
            {gig.title}
          </Link>
          <GigStatusBadge status={gig.status} />
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
            {typeLabel}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatEventDate(gig.eventDate)}
          </span>
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="h-3.5 w-3.5" />
          {gig._count.applications} applicant
          {gig._count.applications !== 1 ? "s" : ""}
        </span>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/dashboard/organizer/gigs/${gig.id}/applications`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/25 hover:text-white"
          >
            Applicants
          </Link>
          <Link
            href={`/dashboard/organizer/gigs/${gig.id}/edit`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/25 hover:text-white"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DJ GIG CARD
// Used in /dashboard/dj/gigs marketplace.
// ============================================================

export function DjGigCard({ gig }: { gig: DjGigListItem }) {
  const typeLabel = GIG_TYPE_FIELDS[gig.gigType].label;
  const location = [gig.city?.name, gig.country?.name]
    .filter(Boolean)
    .join(", ");
  const budgetLabel = formatBudget(
    gig.budgetType,
    gig.budgetMin,
    gig.budgetMax,
    gig.currency,
  );

  const deadlineDeltaMs = gig.applicationDeadline
    ? new Date(gig.applicationDeadline).getTime() - Date.now()
    : null;
  const deadlineWarning =
    deadlineDeltaMs != null &&
    deadlineDeltaMs > 0 &&
    deadlineDeltaMs < 3 * 24 * 60 * 60 * 1000; // within next 3 days

  return (
    <Link
      href={`/dashboard/dj/gigs/${gig.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/8"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
              {typeLabel}
            </span>
            {deadlineWarning && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                Deadline soon
              </span>
            )}
          </div>
          <h3 className="truncate leading-snug font-semibold text-white">
            {gig.title}
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-medium text-white">{budgetLabel}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {formatEventDate(gig.eventDate)}
        </span>
        {location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {gig._count.applications} applied
        </span>
      </div>

      {/* Genres */}
      {gig.requiredGenres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {gig.requiredGenres.slice(0, 4).map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-gray-400"
            >
              {g}
            </span>
          ))}
          {gig.requiredGenres.length > 4 && (
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-gray-500">
              +{gig.requiredGenres.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Organizer footer */}
      <div className="flex items-center gap-2 border-t border-white/8 pt-3">
        {gig.organizerProfile.logoUrl ? (
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
            <Image
              src={gig.organizerProfile.logoUrl}
              alt={gig.organizerProfile.displayName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
            🎪
          </div>
        )}
        <span className="text-xs text-gray-500">
          {gig.organizerProfile.displayName}
        </span>
      </div>
    </Link>
  );
}
