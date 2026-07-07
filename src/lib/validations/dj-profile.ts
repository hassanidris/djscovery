import { z } from "zod";
import { DJ_TYPES } from "@/config/dj-types";

const DJ_TYPE_VALUES = DJ_TYPES.map((t) => t.value) as [string, ...string[]];

const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "spotify",
  "soundcloud",
  "mixcloud",
  "website",
] as const;

const EXPERIENCE_LEVELS = [
  "OPEN",
  "BEGINNER",
  "INTERMEDIATE",
  "PROFESSIONAL",
  "EXPERT",
] as const;

export const CreateDjProfileSchema = z.object({
  // Basic info
  stageName: z
    .string()
    .min(2, "Stage name must be at least 2 characters")
    .max(50, "Stage name must be 50 characters or less")
    .regex(
      /^[a-zA-Z0-9\s\-_']+$/,
      "Stage name can only contain letters, numbers, spaces, hyphens, underscores, and apostrophes",
    ),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),

  // Experience
  experienceYears: z
    .number()
    .int("Years must be a whole number")
    .min(0, "Years must be 0 or more")
    .max(50, "Years must be 50 or less")
    .optional(),
  // experienceLevel is auto-calculated from experienceYears

  // Fee/Pricing
  feeMin: z.number().int().min(0).optional(),
  feeMax: z.number().int().min(0).optional(),
  feeCurrency: z.string().max(3).optional(),

  // Cover Image
  coverImageUrl: z.string().url().optional(),

  // Contact Information
  bookingEmail: z.string().email().optional(),
  bookingPhone: z.string().optional(),

  // Location
  countryId: z.number().int().positive("Country is required"),
  cityId: z.number().int().positive("City is required"),

  // DJ Types (at least one required)
  djTypes: z
    .array(z.enum(DJ_TYPE_VALUES))
    .min(1, "Select at least one DJ type")
    .max(5, "Select up to 5 DJ types"),

  // Genres (at least one required, max 5)
  genreNames: z
    .array(z.string().min(1).max(50))
    .min(1, "Select at least one genre")
    .max(5, "Select up to 5 genres"),

  // Social links (at least one required)
  socialLinks: z
    .array(
      z.object({
        platform: z.enum(SOCIAL_PLATFORMS),
        url: z
          .string()
          .url("Invalid URL")
          .min(1, "URL is required")
          .refine(
            (url) => url.startsWith("http://") || url.startsWith("https://"),
            "URL must start with http:// or https://",
          ),
      }),
    )
    .min(1, "Add at least one social media link")
    .max(7, "Add up to 7 social media links"),

  // Media (optional)
  media: z
    .array(
      z.object({
        type: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
        url: z.string().url("Invalid URL"),
        path: z.string(),
        bucket: z.string(),
      }),
    )
    .optional(),
});

export type CreateDjProfileInput = z.infer<typeof CreateDjProfileSchema>;
