// ============================================================
// PROFILE COMPLETION
// Works against the DjDemoData intermediate format used by
// both DjProfileFree and DjProfilePremium components.
// Each check is weighted — total weight sums to 100.
// ============================================================

import type { DjDemoData } from "@/types/dj-demo";

export interface CompletionField {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
  suggestion: string;
}

export interface ProfileCompletion {
  percentage: number;
  score: number;
  maxScore: number;
  fields: CompletionField[];
  suggestions: string[]; // Only for incomplete fields, ordered by weight desc
}

interface CompletionCheck {
  key: string;
  label: string;
  suggestion: string;
  weight: number;
  check: (d: DjDemoData) => boolean;
}

const COMPLETION_CHECKS: CompletionCheck[] = [
  {
    key: "stageName",
    label: "Stage Name",
    suggestion: "Set your DJ stage name",
    weight: 12,
    check: (d) => d.stageName.trim().length >= 2,
  },
  {
    key: "avatar",
    label: "Profile Photo",
    suggestion: "Upload a profile photo",
    weight: 14,
    check: (d) => {
      const url = d.avatar.url;
      return url.trim().length > 0 && !url.includes("noAvatar");
    },
  },
  {
    key: "location",
    label: "Location",
    suggestion: "Add your city and country",
    weight: 10,
    check: (d) => d.location.city.trim() !== "" && d.location.country.trim() !== "",
  },
  {
    key: "genres",
    label: "Genres",
    suggestion: "Add at least one genre you play",
    weight: 10,
    check: (d) => d.genres.length > 0,
  },
  {
    key: "bio",
    label: "Biography",
    suggestion: "Write a short biography (at least 50 characters)",
    weight: 14,
    check: (d) => d.bio.trim().length >= 50,
  },
  {
    key: "bookingContact",
    label: "Booking Contact",
    suggestion: "Add a booking email or phone number",
    weight: 18,
    check: (d) =>
      d.booking.email.trim() !== "" || d.booking.phone.trim() !== "",
  },
  {
    key: "socialLinks",
    label: "Social / Music Links",
    suggestion: "Connect at least one social or music platform",
    weight: 12,
    check: (d) => Object.values(d.socials).some(Boolean),
  },
  {
    key: "coverImage",
    label: "Cover Image",
    suggestion: "Upload a cover image for your profile",
    weight: 5,
    check: (d) => {
      const url = d.coverImage.url;
      return url.trim().length > 0 && !url.includes("noCover");
    },
  },
  {
    key: "mediaPhoto",
    label: "Gallery Photo",
    suggestion: "Add at least one photo to your gallery",
    weight: 5,
    check: (d) => d.media.photos.length > 0,
  },
];

export function calculateProfileCompletion(
  djData: DjDemoData,
): ProfileCompletion {
  const maxScore = COMPLETION_CHECKS.reduce((sum, c) => sum + c.weight, 0);
  let score = 0;

  const fields: CompletionField[] = COMPLETION_CHECKS.map((c) => {
    const completed = c.check(djData);
    if (completed) score += c.weight;
    return {
      key: c.key,
      label: c.label,
      completed,
      weight: c.weight,
      suggestion: c.suggestion,
    };
  });

  const suggestions = fields
    .filter((f) => !f.completed)
    .sort((a, b) => b.weight - a.weight)
    .map((f) => f.suggestion);

  const percentage = Math.round((score / maxScore) * 100);

  return { percentage, score, maxScore, fields, suggestions };
}
