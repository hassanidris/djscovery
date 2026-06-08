// ============================================================
// PLAN FEATURE GATES
// Single source of truth for Free vs Premium access.
// Extend DJ_PLANS to add PRO / AGENCY / ENTERPRISE without
// touching any component or action code.
// ============================================================

export const DJ_PLANS = ["FREE", "PREMIUM"] as const;
export type DjPlanTier = (typeof DJ_PLANS)[number];

export interface PlanFeatures {
  // Media limits (Infinity = unlimited)
  maxPhotos: number;
  maxVideos: number;
  maxMixes: number;
  // Discovery & visibility
  featuredPlacement: boolean;
  prioritySearchRanking: boolean;
  // Profile features
  verifiedBadge: boolean;
  advancedProfileSections: boolean; // endorsements, press, packages
  // Analytics & stats
  analyticsAccess: boolean;
  responseRateStats: boolean;
  // Booking
  bookingInquiries: boolean; // ALL plans — never block inquiries
  availabilityCalendar: boolean;
  advancedBookingTools: boolean;
}

export const PLAN_FEATURES: Record<DjPlanTier, PlanFeatures> = {
  FREE: {
    maxPhotos: 6,
    maxVideos: 1,
    maxMixes: 1,
    featuredPlacement: false,
    prioritySearchRanking: false,
    verifiedBadge: false,
    advancedProfileSections: false,
    analyticsAccess: false,
    responseRateStats: false,
    bookingInquiries: true,
    availabilityCalendar: false,
    advancedBookingTools: false,
  },
  PREMIUM: {
    maxPhotos: Infinity,
    maxVideos: Infinity,
    maxMixes: Infinity,
    featuredPlacement: true,
    prioritySearchRanking: true,
    verifiedBadge: true,
    advancedProfileSections: true,
    analyticsAccess: true,
    responseRateStats: true,
    bookingInquiries: true,
    availabilityCalendar: true,
    advancedBookingTools: true,
  },
} as const;

/**
 * Check if a plan has access to a boolean feature.
 * Usage: hasFeature("FREE", "verifiedBadge") → false
 */
export function hasFeature(
  plan: DjPlanTier,
  feature: keyof Omit<PlanFeatures, "maxPhotos" | "maxVideos" | "maxMixes">,
): boolean {
  return PLAN_FEATURES[plan][feature];
}

/**
 * Get the media upload limit for a given plan and media type.
 * Returns Infinity for unlimited plans.
 * Usage: getMediaLimit("FREE", "photos") → 6
 */
export function getMediaLimit(
  plan: DjPlanTier,
  type: "photos" | "videos" | "mixes",
): number {
  const key = {
    photos: "maxPhotos",
    videos: "maxVideos",
    mixes: "maxMixes",
  } as const;
  return PLAN_FEATURES[plan][key[type]];
}

/**
 * Normalise a plan string coming from the DB or demo data to a DjPlanTier.
 * Accepts "free"/"FREE" and "premium"/"PREMIUM".
 * Falls back to "FREE" for any unknown value.
 */
export function normalisePlan(raw: string | null | undefined): DjPlanTier {
  const upper = (raw ?? "").toUpperCase();
  if (upper === "PREMIUM") return "PREMIUM";
  return "FREE";
}
