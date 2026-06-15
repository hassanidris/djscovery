import prisma from "@/lib/client";
import { GigType, ExperienceLevel } from "@prisma/client";

// ============================================================
// FILTER TYPES
// ============================================================

export type DjGigFilters = {
  gigType?: GigType;
  countryId?: number;
  cityId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel?: ExperienceLevel;
  search?: string;
};

// ============================================================
// SHARED SELECT SHAPES
// Define reusable field selection objects so every query uses
// the same field list and private fields are only ever included
// in the one place that is allowed to see them.
// ============================================================

/** Fields safe to show any authenticated DJ — no private data. */
const publicGigSelect = {
  id: true,
  slug: true,
  title: true,
  gigType: true,
  description: true,
  status: true,
  eventDate: true,
  applicationDeadline: true,
  countryId: true,
  country: { select: { id: true, name: true, code: true } },
  cityId: true,
  city: { select: { id: true, name: true } },
  venueName: true,
  hideVenueName: true,
  budgetType: true,
  budgetMin: true,
  budgetMax: true,
  currency: true,
  requiredGenres: true,
  requiredExperienceLevel: true,
  setDurationMinutes: true,
  guestCount: true,
  dressCode: true,
  mcRequired: true,
  micRequired: true,
  languagesSpoken: true,
  venueProvides: true,
  djMustBring: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  organizerProfile: {
    select: {
      id: true,
      displayName: true,
      slug: true,
      logoUrl: true,
      organizerType: true,
    },
  },
  _count: { select: { applications: true } },
} as const;

/** Private logistics fields — only accessible to the accepted DJ. */
const privateGigFields = {
  venueAddress: true,
  venuePostalCode: true,
  organizerContactName: true,
  organizerContactPhone: true,
  organizerContactEmail: true,
  arrivalInstructions: true,
  setupNotes: true,
} as const;

/** Full gig select for organizer (owns the gig — sees everything). */
const fullGigSelect = {
  ...publicGigSelect,
  ...privateGigFields,
} as const;

// ============================================================
// 1. ORGANIZER — GIG LIST
// Returns all gigs for this organizer's dashboard, ordered by
// most recently created. Includes application count badge.
// ============================================================

export async function getOrganizerGigs(organizerProfileId: number) {
  return prisma.gig.findMany({
    where: {
      organizerProfileId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      gigType: true,
      status: true,
      eventDate: true,
      applicationDeadline: true,
      city: { select: { name: true } },
      country: { select: { name: true } },
      createdAt: true,
      _count: { select: { applications: true } },
    },
  });
}

export type OrganizerGigListItem = Awaited<
  ReturnType<typeof getOrganizerGigs>
>[number];

// ============================================================
// 2. ORGANIZER — GIG DETAIL
// Full gig including all private fields. Ownership-checked:
// returns null if the gig does not belong to this organizer.
// ============================================================

export async function getOrganizerGigDetail(
  gigId: number,
  organizerProfileId: number,
) {
  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: fullGigSelect,
  });

  if (!gig || gig.organizerProfile.id !== organizerProfileId) return null;
  return gig;
}

export type OrganizerGigDetail = NonNullable<
  Awaited<ReturnType<typeof getOrganizerGigDetail>>
>;

// ============================================================
// 3. DJ — PUBLISHED GIG MARKETPLACE
// Public shape only — no private fields ever included.
// Only returns PUBLISHED gigs where eventDate is in the future.
// Applies optional DJ-facing filters.
// ============================================================

export async function getPublishedGigsForDj(filters: DjGigFilters = {}) {
  const {
    gigType,
    countryId,
    cityId,
    dateFrom,
    dateTo,
    budgetMin,
    budgetMax,
    experienceLevel,
    search,
  } = filters;

  return prisma.gig.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      eventDate: {
        gte: dateFrom ?? new Date(), // never show gigs in the past
        ...(dateTo ? { lte: dateTo } : {}),
      },
      ...(gigType ? { gigType } : {}),
      ...(countryId ? { countryId } : {}),
      ...(cityId ? { cityId } : {}),
      ...(experienceLevel ? { requiredExperienceLevel: experienceLevel } : {}),
      ...(budgetMin != null ? { budgetMin: { gte: budgetMin } } : {}),
      ...(budgetMax != null ? { budgetMax: { lte: budgetMax } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { eventDate: "asc" },
    select: publicGigSelect,
  });
}

export type DjGigListItem = Awaited<
  ReturnType<typeof getPublishedGigsForDj>
>[number];

// ============================================================
// 4. DJ — GIG DETAIL (with conditional venue reveal)
// Strategy:
//   a) Fetch the full gig (1 query).
//   b) Fetch the DJ's application for this gig (1 query).
//   c) If application status is ACCEPTED → return full gig.
//      Otherwise → zero out private fields before returning.
// This ensures private fields never reach the client unless
// the DJ is the accepted applicant.
// ============================================================

export async function getDjGigDetail(gigId: number, djProfileId: number) {
  // First check if DJ has an accepted application — if so, allow viewing regardless of gig status
  const application = await prisma.gigApplication.findUnique({
    where: { gigId_djProfileId: { gigId, djProfileId } },
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      shortlistedAt: true,
      acceptedAt: true,
      rejectedAt: true,
      withdrawnAt: true,
    },
  });

  const isAccepted = application?.status === "ACCEPTED";

  const gig = await prisma.gig.findUnique({
    where: {
      id: gigId,
      deletedAt: null,
      // Accepted DJs can view any status; others only see PUBLISHED
      ...(isAccepted ? {} : { status: "PUBLISHED" }),
    },
    select: fullGigSelect,
  });

  if (!gig) return null;

  const venueRevealed = isAccepted;

  if (!venueRevealed) {
    return {
      gig: {
        ...gig,
        venueAddress: null,
        venuePostalCode: null,
        organizerContactName: null,
        organizerContactPhone: null,
        organizerContactEmail: null,
        arrivalInstructions: null,
        setupNotes: null,
      },
      application,
      venueRevealed: false as const,
    };
  }

  return { gig, application, venueRevealed: true as const };
}

export type DjGigDetailResult = NonNullable<
  Awaited<ReturnType<typeof getDjGigDetail>>
>;

// ============================================================
// 5. DJ — MY APPLICATIONS
// All applications for this DJ, with gig summary data needed
// to render the "My Applications" list page.
// ============================================================

export async function getDjApplications(djProfileId: number) {
  return prisma.gigApplication.findMany({
    where: { djProfileId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      shortlistedAt: true,
      acceptedAt: true,
      rejectedAt: true,
      withdrawnAt: true,
      gig: {
        select: {
          id: true,
          slug: true,
          title: true,
          gigType: true,
          status: true,
          eventDate: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
          organizerProfile: {
            select: {
              displayName: true,
              logoUrl: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

export type DjApplicationListItem = Awaited<
  ReturnType<typeof getDjApplications>
>[number];

// ============================================================
// 6. ORGANIZER — GIG APPLICANTS
// All applications for a specific gig with full DJ profile
// data needed to render the applicant management table.
// Ownership-checked: returns null if the gig does not belong
// to this organizer.
// ============================================================

export async function getGigApplicants(
  gigId: number,
  organizerProfileId: number,
) {
  const gig = await prisma.gig.findUnique({
    where: { id: gigId, deletedAt: null },
    select: { organizerProfileId: true, title: true, status: true },
  });

  if (!gig || gig.organizerProfileId !== organizerProfileId) return null;

  const applications = await prisma.gigApplication.findMany({
    where: { gigId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      shortlistedAt: true,
      acceptedAt: true,
      rejectedAt: true,
      withdrawnAt: true,
      djProfile: {
        select: {
          id: true,
          stageName: true,
          slug: true,
          avatar: true,
          status: true,
          cityId: true,
          city: { select: { name: true } },
          country: { select: { name: true } },
          genres: {
            select: { genre: { select: { name: true } } },
          },
        },
      },
    },
  });

  return { gig, applications };
}

export type GigApplicantsResult = NonNullable<
  Awaited<ReturnType<typeof getGigApplicants>>
>;
export type GigApplicant = GigApplicantsResult["applications"][number];
