import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/client";
import { formatNumber } from "@/lib/utils/currency";
import {
  MapPin,
  Globe,
  Briefcase,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { ReportButton } from "@/components/reporting/ReportButton";
import OrganizerReviews from "@/components/organizer/OrganizerReviews";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

const ORGANIZER_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual",
  COMPANY: "Company",
  VENUE: "Venue",
  AGENCY: "Agency",
  FESTIVAL: "Festival",
};

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "📸",
  linkedin: "💼",
  facebook: "📘",
  tiktok: "🎵",
  youtube: "▶️",
  website: "🌐",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeHref(url: string): string | null {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.organizerProfile.findUnique({
    where: { slug, status: "ACTIVE", deletedAt: null },
    select: {
      displayName: true,
      bio: true,
      logoUrl: true,
      organizerType: true,
      _count: {
        select: {
          gigs: {
            where: {
              deletedAt: null,
              status: { in: ["PUBLISHED", "FILLED", "CANCELLED", "EXPIRED"] },
            },
          },
        },
      },
    },
  });

  if (!profile || profile._count.gigs === 0) {
    return { title: "Organizer not found — DJcovery" };
  }

  const typeLabel = ORGANIZER_TYPE_LABELS[profile.organizerType] ?? "";
  return {
    title: `${profile.displayName} · ${typeLabel} on DJcovery`,
    description:
      profile.bio?.slice(0, 155) ??
      `${profile.displayName} books and hires DJs on DJcovery.`,
    openGraph: {
      title: `${profile.displayName} on DJcovery`,
      description: profile.bio?.slice(0, 155) ?? "",
      images: profile.logoUrl ? [{ url: profile.logoUrl }] : [],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function OrganizerPublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch only fields safe to render publicly.
  // contactEmail and phone are intentionally NOT selected.
  const profile = await prisma.organizerProfile.findUnique({
    where: { slug, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      displayName: true,
      slug: true,
      organizerType: true,
      bio: true,
      logoUrl: true,
      coverImageUrl: true,
      website: true,
      createdAt: true,
      country: { select: { name: true } },
      city: { select: { name: true } },
      socialLinks: {
        select: { platform: true, url: true },
        orderBy: { id: "asc" },
      },
      _count: {
        select: {
          gigs: {
            where: {
              deletedAt: null,
              status: { in: ["PUBLISHED", "FILLED", "CANCELLED", "EXPIRED"] },
            },
          },
        },
      },
    },
  });

  if (!profile) return notFound();

  // Profile is only publicly visible after the organizer has posted at least one gig
  if (profile._count.gigs === 0) return notFound();

  const activeGigs = await prisma.gig.findMany({
    where: {
      organizerProfileId: profile.id,
      status: "PUBLISHED",
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      gigType: true,
      budgetType: true,
      budgetMin: true,
      budgetMax: true,
      currency: true,
      eventDate: true,
      createdAt: true,
    },
    take: 6,
  });

  const pastGigs = await prisma.gig.findMany({
    where: {
      organizerProfileId: profile.id,
      status: { in: ["FILLED", "CANCELLED", "EXPIRED"] },
      deletedAt: null,
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, gigType: true, updatedAt: true },
    take: 6,
  });

  // Fetch organizer reviews
  const organizerReviews = await prisma.organizerReview.findMany({
    where: {
      organizerProfileId: profile.id,
    },
    include: {
      djProfile: {
        select: {
          slug: true,
          stageName: true,
          avatar: true,
          status: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const avgRating =
    organizerReviews.length > 0
      ? organizerReviews.reduce((sum, r) => sum + r.rating, 0) /
        organizerReviews.length
      : 0;

  const typeLabel =
    ORGANIZER_TYPE_LABELS[profile.organizerType] ?? profile.organizerType;
  const location = [profile.city?.name, profile.country?.name]
    .filter(Boolean)
    .join(", ");
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Cover image */}
      <div className="relative h-48 w-full overflow-hidden bg-linear-to-br from-white/5 to-white/2 sm:h-64 md:h-80">
        {profile.coverImageUrl && (
          <Image
            src={profile.coverImageUrl}
            alt={`${profile.displayName} cover`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-8">
        {/* Hero section — sits below cover with logo overlapping */}
        <div className="relative z-10 -mt-14 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Logo */}
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-black bg-white/10 shadow-xl">
            {profile.logoUrl ? (
              <Image
                src={profile.logoUrl}
                alt={`${profile.displayName} logo`}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl">
                🎪
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex flex-1 flex-col gap-1 pt-2 pb-1 sm:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                {profile.displayName}
              </h1>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                {typeLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {location}
                </span>
              )}
              <span className="text-gray-600">·</span>
              <span>Organizer since {memberSince}</span>
            </div>

            {/* Social links + website */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {profile.website && safeHref(profile.website) && (
                <a
                  href={safeHref(profile.website)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-sm text-gray-300 transition-colors hover:border-white/25 hover:text-white"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              )}
              {profile.socialLinks.map((link) => {
                const href = safeHref(link.url);
                if (!href) return null;
                return (
                  <a
                    key={link.platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.platform}
                    className="rounded-lg border border-white/10 px-3 py-1 text-sm text-gray-400 transition-colors hover:border-white/25 hover:text-white"
                  >
                    {SOCIAL_ICONS[link.platform] ?? "🔗"}{" "}
                    <span className="capitalize">{link.platform}</span>
                  </a>
                );
              })}
              <ReportButton
                targetType="ORGANIZER_PROFILE"
                targetId={String(profile.id)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10 pb-20">
          {/* About */}
          {profile.bio && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-white">About</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-400">
                {profile.bio}
              </p>
            </section>
          )}

          {/* Active gigs */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Active Gigs
              </h2>
              {activeGigs.length > 0 && (
                <span className="bg-h_red/20 text-h_red rounded-full px-2 py-0.5 text-xs font-medium">
                  {activeGigs.length}
                </span>
              )}
            </div>

            {activeGigs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                <Briefcase className="mx-auto mb-2 h-6 w-6 text-gray-700" />
                <p className="text-sm text-gray-600">
                  No active gigs at this time.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4"
                  >
                    <div>
                      <p className="font-medium text-white">{gig.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(gig.eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {gig.budgetType === "FIXED" && gig.budgetMin != null && (
                      <span className="shrink-0 rounded-lg bg-white/8 px-3 py-1 text-sm font-medium text-gray-300">
                        {gig.currency} {formatNumber(gig.budgetMin)}
                      </span>
                    )}
                    {gig.budgetType === "RANGE" &&
                      gig.budgetMin != null &&
                      gig.budgetMax != null && (
                        <span className="shrink-0 rounded-lg bg-white/8 px-3 py-1 text-sm font-medium text-gray-300">
                          {gig.currency} {formatNumber(gig.budgetMin)} –{" "}
                          {formatNumber(gig.budgetMax)}
                        </span>
                      )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past gigs */}
          {pastGigs.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Past Gigs
                </h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-400">
                  {pastGigs.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {pastGigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="flex items-center justify-between rounded-xl border border-white/8 px-5 py-3 text-sm"
                  >
                    <span className="text-gray-400">{gig.title}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(gig.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {organizerReviews.length > 0 && (
            <OrganizerReviews
              avgRating={avgRating}
              ratingCount={organizerReviews.length}
              reviews={organizerReviews}
            />
          )}

          {/* Contact */}
          {profile.website && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-white">
                Get in Touch
              </h2>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm text-gray-300 transition-colors hover:border-white/30 hover:text-white"
              >
                <Globe className="h-4 w-4" />
                Contact via website
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
              <p className="mt-2 text-xs text-gray-600">
                Direct contact details are kept private.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
