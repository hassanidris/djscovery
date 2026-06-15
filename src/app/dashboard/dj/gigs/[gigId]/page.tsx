import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Lock,
  Unlock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { getDjGigDetail } from "@/lib/queries/gigs";
import { GigStatusBadge } from "@/components/gigs/GigStatusBadge";
import { GigApplicationButton } from "@/components/gigs/GigApplicationButton";
import { GIG_TYPE_FIELDS } from "@/config/gig-type-fields";

export default async function DjGigDetailPage({
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

  const djProfile = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });

  // Allow viewing without a DJ profile, but can't apply
  const djProfileId = djProfile?.id ?? -1;

  const result = await getDjGigDetail(gigId, djProfileId);
  if (!result) return notFound();

  const { gig, application, venueRevealed } = result;

  const typeLabel = GIG_TYPE_FIELDS[gig.gigType].label;
  const location = [gig.city?.name, gig.country?.name]
    .filter(Boolean)
    .join(", ");

  const budgetStr =
    gig.budgetType === "TBA"
      ? "Budget TBA"
      : gig.budgetType === "NEGOTIABLE"
        ? "Negotiable"
        : gig.budgetType === "FIXED" && gig.budgetMin != null
          ? `${gig.currency} ${gig.budgetMin.toLocaleString()}`
          : gig.budgetMin != null && gig.budgetMax != null
            ? `${gig.currency} ${gig.budgetMin.toLocaleString()} – ${gig.budgetMax.toLocaleString()}`
            : "Budget TBA";

  const canApply =
    djProfile?.status === "APPROVED" && gig.status === "PUBLISHED";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Link
          href="/dashboard/dj/gigs"
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Gigs
        </Link>

        {/* Title block */}
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <GigStatusBadge status={gig.status} />
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
              {typeLabel}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{gig.title}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Key info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: CalendarDays,
                  label: "Event Date",
                  value: new Date(gig.eventDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }),
                },
                { icon: DollarSign, label: "Budget", value: budgetStr },
                { icon: MapPin, label: "Location", value: location || "TBC" },
                ...(gig.setDurationMinutes
                  ? [
                      {
                        icon: Clock,
                        label: "Set Duration",
                        value: `${gig.setDurationMinutes} min`,
                      },
                    ]
                  : []),
                ...(gig.guestCount
                  ? [
                      {
                        icon: Users,
                        label: "Guests",
                        value: `~${gig.guestCount}`,
                      },
                    ]
                  : []),
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
              <div>
                <h2 className="mb-2 text-sm font-semibold text-white">
                  About this gig
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-gray-400">
                  {gig.description}
                </p>
              </div>
            )}

            {/* Requirements */}
            {(gig.requiredGenres.length > 0 ||
              gig.requiredExperienceLevel !== "OPEN" ||
              gig.dressCode ||
              gig.mcRequired ||
              gig.micRequired) && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">
                  Requirements
                </h2>
                <dl className="flex flex-col gap-3 text-sm">
                  {gig.requiredExperienceLevel !== "OPEN" && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Experience level</dt>
                      <dd className="text-white capitalize">
                        {gig.requiredExperienceLevel.toLowerCase()}
                      </dd>
                    </div>
                  )}
                  {gig.dressCode && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Dress code</dt>
                      <dd className="text-white">{gig.dressCode}</dd>
                    </div>
                  )}
                  {gig.mcRequired && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">MC required</dt>
                      <dd className="text-white">Yes</dd>
                    </div>
                  )}
                  {gig.micRequired && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Microphone</dt>
                      <dd className="text-white">Required</dd>
                    </div>
                  )}
                  {gig.requiredGenres.length > 0 && (
                    <div>
                      <dt className="mb-2 text-gray-500">Genres</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {gig.requiredGenres.map((g) => (
                          <span
                            key={g}
                            className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-gray-300"
                          >
                            {g}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Equipment */}
            {(gig.venueProvides.length > 0 || gig.djMustBring.length > 0) && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">
                  Equipment
                </h2>
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
              </div>
            )}

            {/* Venue info — conditional reveal */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-5">
              <div className="mb-3 flex items-center gap-2">
                {venueRevealed ? (
                  <Unlock className="h-4 w-4 text-green-400" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-500" />
                )}
                <h2 className="text-sm font-semibold text-white">
                  Venue & Logistics
                </h2>
              </div>

              {venueRevealed ? (
                <dl className="flex flex-col gap-3 text-sm">
                  {gig.venueName && (
                    <div>
                      <dt className="text-xs text-gray-500">Venue</dt>
                      <dd className="text-white">{gig.venueName}</dd>
                    </div>
                  )}
                  {gig.venueAddress && (
                    <div>
                      <dt className="text-xs text-gray-500">Address</dt>
                      <dd className="text-white">{gig.venueAddress}</dd>
                    </div>
                  )}
                  {gig.organizerContactName && (
                    <div>
                      <dt className="text-xs text-gray-500">Contact</dt>
                      <dd className="text-white">{gig.organizerContactName}</dd>
                    </div>
                  )}
                  {gig.organizerContactPhone && (
                    <div>
                      <dt className="text-xs text-gray-500">Phone</dt>
                      <dd className="text-white">
                        {gig.organizerContactPhone}
                      </dd>
                    </div>
                  )}
                  {gig.arrivalInstructions && (
                    <div>
                      <dt className="text-xs text-gray-500">Arrival</dt>
                      <dd className="whitespace-pre-line text-white">
                        {gig.arrivalInstructions}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-gray-500">
                  {!gig.hideVenueName && gig.venueName ? (
                    <>
                      <span className="text-white">{gig.venueName}</span> ·{" "}
                    </>
                  ) : null}
                  Full address and contact details are revealed once your
                  application is accepted.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar: organizer + apply */}
          <div className="flex flex-col gap-4">
            {/* Apply button */}
            {canApply ? (
              <GigApplicationButton
                gigId={gig.id}
                applicationId={application?.id ?? null}
                applicationStatus={application?.status ?? null}
              />
            ) : djProfile && djProfile.status !== "APPROVED" ? (
              <div className="rounded-xl border border-white/10 px-5 py-4 text-center text-sm text-gray-500">
                Your DJ profile must be approved before you can apply.
              </div>
            ) : null}

            {/* Organizer card */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <p className="mb-3 text-xs text-gray-500">Posted by</p>
              <Link
                href={`/organizers/${gig.organizerProfile.slug}`}
                className="flex items-center gap-3 hover:opacity-80"
              >
                {gig.organizerProfile.logoUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={gig.organizerProfile.logoUrl}
                      alt={gig.organizerProfile.displayName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg">
                    🎪
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {gig.organizerProfile.displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {gig._count.applications} applied
                  </p>
                </div>
              </Link>
            </div>

            {/* Deadline */}
            {gig.applicationDeadline && (
              <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-xs text-gray-500">Application deadline</p>
                <p className="mt-0.5 text-sm text-white">
                  {new Date(gig.applicationDeadline).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
