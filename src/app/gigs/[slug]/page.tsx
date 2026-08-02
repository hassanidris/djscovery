import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { GigStatusBadge } from "@/components/gigs/GigStatusBadge";
import { GIG_TYPE_FIELDS } from "@/config/gig-type-fields";
import { GigReviewForm } from "@/components/reputation/GigReviewForm";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils/duration";
import { formatNumber } from "@/lib/utils/currency";
import { ReportButton } from "@/components/reporting/ReportButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gig = await prisma.gig.findUnique({
    where: { slug, deletedAt: null },
    select: { title: true },
  });
  return { title: gig?.title ? `${gig.title} | DJcovery` : "Gig | DJcovery" };
}

function getReviewDaysRemaining(completedAt: Date | string): number {
  return Math.max(
    0,
    30 -
      Math.floor(
        (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
  );
}

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const gig = await prisma.gig.findUnique({
    where: { slug, deletedAt: null },
    include: {
      country: { select: { name: true } },
      city: { select: { name: true } },
      organizerProfile: {
        select: {
          userId: true,
          displayName: true,
          slug: true,
          logoUrl: true,
        },
      },
      applications: {
        where: { status: "ACCEPTED" },
        select: {
          id: true,
          djProfile: {
            select: {
              id: true,
              userId: true,
              stageName: true,
              slug: true,
              avatar: true,
            },
          },
          hire: { select: { status: true, completedAt: true } },
        },
      },
      gigReviews: { select: { id: true, organizerId: true } },
      organizerReviews: { select: { id: true, djProfileId: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!gig) return notFound();

  const isOrganizer = user?.id === gig.organizerProfile.userId;
  const accepted = gig.applications[0];
  const isAcceptedDj = user?.id === accepted?.djProfile.userId;
  const hire = accepted?.hire;
  if (!isOrganizer && !isAcceptedDj && gig.status !== "PUBLISHED")
    return notFound();

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
          ? `${gig.currency} ${formatNumber(gig.budgetMin)}`
          : gig.budgetMin != null && gig.budgetMax != null
            ? `${gig.currency} ${formatNumber(gig.budgetMin)} – ${formatNumber(gig.budgetMax)}`
            : "Budget TBA";

  const canReview =
    isOrganizer &&
    gig.status === "COMPLETED" &&
    hire?.status === "COMPLETED" &&
    gig.gigReviews.length === 0;

  const daysRemaining =
    canReview && hire?.completedAt
      ? getReviewDaysRemaining(hire.completedAt)
      : null;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href={isOrganizer ? "/organizer/gigs" : "/gigs"}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isOrganizer ? "My Gigs" : "Gigs"}
          </Link>
        </div>

        {/* Title + badges */}
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <GigStatusBadge status={gig.status} />
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                {typeLabel}
              </span>
            </div>
            {!isOrganizer && !isAcceptedDj && (
              <ReportButton
                targetType="GIG"
                targetId={String(gig.id)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{gig.title}</h1>
        </div>

        {/* Organizer review prompt */}
        {canReview && accepted && (
          <div className="mb-8">
            {daysRemaining !== null && daysRemaining <= 7 && (
              <div className="mb-2 flex items-center gap-2 text-xs text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                {daysRemaining} days left to review
              </div>
            )}
            <GigReviewForm
              gigId={gig.id}
              djProfileId={accepted.djProfile.id}
              djName={accepted.djProfile.stageName}
              gigTitle={gig.title}
            />
          </div>
        )}

        {/* DJ organizer review prompt */}
        {isAcceptedDj &&
          accepted &&
          hire?.status === "COMPLETED" &&
          gig.organizerReviews.length === 0 && (
            <div className="mb-8">
              <Link
                href={`/gigs/${gig.slug}/organizer-review`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition-colors hover:border-white/20 hover:text-white"
              >
                <Star className="h-4 w-4" />
                Review {gig.organizerProfile.displayName}
              </Link>
            </div>
          )}

        {isOrganizer &&
          gig.status === "COMPLETED" &&
          accepted &&
          gig.gigReviews.length > 0 && (
            <div className="mb-8 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-300">
              <Star className="h-4 w-4" />
              You have reviewed this gig.
            </div>
          )}

        {isAcceptedDj &&
          accepted &&
          hire?.status === "COMPLETED" &&
          gig.organizerReviews.length > 0 && (
            <div className="mb-8 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-300">
              <Star className="h-4 w-4" />
              You have reviewed this organizer.
            </div>
          )}

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

        {/* Organizer card */}
        <Link
          href={`/organizers/${gig.organizerProfile.slug}`}
          className="mb-8 flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-4 transition-colors hover:border-white/15"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white/5">
            {gig.organizerProfile.logoUrl ? (
              <Image
                src={gig.organizerProfile.logoUrl}
                alt={gig.organizerProfile.displayName ?? "Organizer"}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">
                {(gig.organizerProfile.displayName ?? "O")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500">Organizer</p>
            <p className="text-sm font-medium text-white">
              {gig.organizerProfile.displayName ?? "Organizer"}
            </p>
          </div>
        </Link>

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

        {/* Private logistics — organizer and accepted DJ */}
        {(isOrganizer || isAcceptedDj) && (
          <section className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded bg-amber-500/10 p-1">
                <span className="text-xs font-bold text-amber-400">
                  Private
                </span>
              </div>
              <h2 className="text-sm font-semibold text-amber-300">
                Private details
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
                  <dd className="text-amber-100">
                    {gig.organizerContactPhone}
                  </dd>
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
        )}

        {/* CTA for organizer to edit */}
        {isOrganizer && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-white">View Applicants</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/organizer/gigs/${gig.id}/applications`}>
                {gig._count.applications}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
