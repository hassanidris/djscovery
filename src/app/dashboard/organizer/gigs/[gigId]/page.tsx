import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getOrganizerGigDetail } from "@/lib/queries/gigs";
import { GigStatusBadge } from "@/components/gigs/GigStatusBadge";
import { GigActions } from "@/components/gigs/GigActions";
import { GIG_TYPE_FIELDS } from "@/config/gig-type-fields";
import { formatDuration } from "@/lib/utils/duration";

export default async function OrganizerGigDetailPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId: gigIdRaw } = await params;
  const gigId = parseInt(gigIdRaw, 10);
  if (isNaN(gigId)) return notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const orgProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, deletedAt: true },
  });
  if (
    !orgProfile ||
    orgProfile.status !== "ACTIVE" ||
    orgProfile.deletedAt !== null
  )
    redirect("/become-organizer");

  const gig = await getOrganizerGigDetail(gigId, orgProfile.id);
  if (!gig) return notFound();

  const typeLabel = GIG_TYPE_FIELDS[gig.gigType].label;
  const location = [gig.city?.name, gig.country?.name]
    .filter(Boolean)
    .join(", ");

  function formatDate(d: Date) {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const budgetLabel =
    gig.budgetType === "TBA"
      ? "Budget TBA"
      : gig.budgetType === "NEGOTIABLE"
        ? "Negotiable"
        : gig.budgetType === "FIXED" && gig.budgetMin != null
          ? `${gig.currency} ${gig.budgetMin.toLocaleString()}`
          : gig.budgetMin != null && gig.budgetMax != null
            ? `${gig.currency} ${gig.budgetMin.toLocaleString()} – ${gig.budgetMax.toLocaleString()}`
            : "Budget TBA";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        {/* Back + edit link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/organizer/gigs"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            My Gigs
          </Link>
          <Link
            href={`/dashboard/organizer/gigs/${gig.id}/edit`}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/25 hover:text-white"
          >
            Edit
          </Link>
        </div>

        {/* Title + badges */}
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <GigStatusBadge status={gig.status} />
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
              {typeLabel}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{gig.title}</h1>
        </div>

        {/* Action buttons */}
        <div className="mb-8">
          <GigActions gigId={gig.id} status={gig.status} />
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: CalendarDays,
              label: "Event Date",
              value: formatDate(gig.eventDate),
            },
            { icon: MapPin, label: "Location", value: location || "Not set" },
            { icon: DollarSign, label: "Budget", value: budgetLabel },
            {
              icon: Users,
              label: "Applications",
              value: String(gig._count.applications),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-xl border border-white/8 bg-white/3 p-4"
            >
              <Icon className="mb-1 h-4 w-4 text-gray-600" />
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {gig.description && (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-white">
              Description
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-400">
              {gig.description}
            </p>
          </section>
        )}

        {/* Requirements */}
        <section className="mb-6 rounded-xl border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Requirements
          </h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {gig.requiredExperienceLevel !== "OPEN" && (
              <div>
                <dt className="text-xs text-gray-500">Experience</dt>
                <dd className="text-white capitalize">
                  {gig.requiredExperienceLevel.toLowerCase()}
                </dd>
              </div>
            )}
            {gig.setDurationMinutes && (
              <div>
                <dt className="text-xs text-gray-500">Set duration</dt>
                <dd className="text-white">
                  {formatDuration(gig.setDurationMinutes)}
                </dd>
              </div>
            )}
            {gig.guestCount && (
              <div>
                <dt className="text-xs text-gray-500">Guest count</dt>
                <dd className="text-white">~{gig.guestCount}</dd>
              </div>
            )}
            {gig.dressCode && (
              <div>
                <dt className="text-xs text-gray-500">Dress code</dt>
                <dd className="text-white">{gig.dressCode}</dd>
              </div>
            )}
            {gig.mcRequired && (
              <div>
                <dt className="text-xs text-gray-500">MC</dt>
                <dd className="text-white">Required</dd>
              </div>
            )}
            {gig.micRequired && (
              <div>
                <dt className="text-xs text-gray-500">Microphone</dt>
                <dd className="text-white">Required</dd>
              </div>
            )}
          </dl>
          {gig.requiredGenres.length > 0 && (
            <div className="mt-4">
              <dt className="mb-2 text-xs text-gray-500">Required genres</dt>
              <div className="flex flex-wrap gap-1.5">
                {gig.requiredGenres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-gray-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Equipment */}
        {(gig.venueProvides.length > 0 || gig.djMustBring.length > 0) && (
          <section className="mb-6 rounded-xl border border-white/8 bg-white/3 p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">Equipment</h2>
            {gig.venueProvides.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-xs text-gray-500">Venue provides</p>
                <div className="flex flex-wrap gap-1.5">
                  {gig.venueProvides.map((e) => (
                    <span
                      key={e}
                      className="rounded-full border border-green-500/20 bg-green-500/5 px-2 py-0.5 text-xs text-green-400"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {gig.djMustBring.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-gray-500">DJ must bring</p>
                <div className="flex flex-wrap gap-1.5">
                  {gig.djMustBring.map((e) => (
                    <span
                      key={e}
                      className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-xs text-amber-400"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Private logistics */}
        <section className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-300">
              Private Details (visible to accepted DJ only)
            </h2>
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {gig.venueName && (
              <div>
                <dt className="text-xs text-amber-500/70">Venue</dt>
                <dd className="text-amber-100">{gig.venueName}</dd>
              </div>
            )}
            {gig.venueAddress && (
              <div>
                <dt className="text-xs text-amber-500/70">Address</dt>
                <dd className="text-amber-100">{gig.venueAddress}</dd>
              </div>
            )}
            {gig.organizerContactName && (
              <div>
                <dt className="text-xs text-amber-500/70">Contact name</dt>
                <dd className="text-amber-100">{gig.organizerContactName}</dd>
              </div>
            )}
            {gig.organizerContactPhone && (
              <div>
                <dt className="text-xs text-amber-500/70">Contact phone</dt>
                <dd className="text-amber-100">{gig.organizerContactPhone}</dd>
              </div>
            )}
            {gig.arrivalInstructions && (
              <div className="col-span-2">
                <dt className="text-xs text-amber-500/70">
                  Arrival instructions
                </dt>
                <dd className="mt-1 text-sm whitespace-pre-line text-amber-100">
                  {gig.arrivalInstructions}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Applicants link */}
        <Link
          href={`/dashboard/organizer/gigs/${gig.id}/applications`}
          className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-4 transition-colors hover:border-white/20"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-white">View Applicants</span>
          </div>
          <span className="text-sm font-semibold text-white">
            {gig._count.applications}
          </span>
        </Link>
      </div>
    </div>
  );
}
