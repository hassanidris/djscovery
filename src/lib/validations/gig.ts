import { z } from "zod";
import { GigType, BudgetType, ExperienceLevel } from "@prisma/client";
import { EQUIPMENT_ITEMS } from "@/config/gig-type-fields";

export type { EquipmentItem } from "@/config/gig-type-fields";

const equipmentItemSchema = z.enum(EQUIPMENT_ITEMS);

// ============================================================
// BASE SHAPE
// Using a plain ZodObject so .partial() works cleanly on all
// derived schemas (createGig, updateGig, publishGig).
// Cross-field refinements are applied per-schema below.
// ============================================================

const gigBaseShape = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title must be at most 120 characters"),

  gigType: z.nativeEnum(GigType),

  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .nullable(),

  eventDate: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Event date must be a valid date",
  }),

  applicationDeadline: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), {
      message: "Deadline must be a valid date",
    })
    .optional()
    .nullable(),

  countryId: z.coerce.number().int().positive("Country is required"),
  cityId: z.coerce.number().int().positive("City is required"),

  venueName: z.string().max(200).optional().nullable(),
  hideVenueName: z.boolean().default(false),
  venueAddress: z.string().max(500).optional().nullable(),
  venuePostalCode: z.string().max(20).optional().nullable(),

  budgetType: z.nativeEnum(BudgetType).default("TBA"),
  budgetMin: z.coerce.number().int().nonnegative().optional().nullable(),
  budgetMax: z.coerce.number().int().nonnegative().optional().nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g. SEK)")
    .transform((v) => v.toUpperCase())
    .default("SEK"),

  requiredGenres: z
    .array(z.string().min(1))
    .max(10, "Maximum 10 genres")
    .default([]),
  requiredExperienceLevel: z.nativeEnum(ExperienceLevel).default("OPEN"),

  setDurationMinutes: z.coerce.number().int().positive().optional().nullable(),
  guestCount: z.coerce.number().int().positive().optional().nullable(),
  dressCode: z.string().max(200).optional().nullable(),
  mcRequired: z.boolean().default(false),
  micRequired: z.boolean().default(false),
  languagesSpoken: z.array(z.string().min(1)).default([]),

  venueProvides: z
    .array(equipmentItemSchema, {
      invalid_type_error: "Invalid equipment item",
    })
    .default([]),
  djMustBring: z
    .array(equipmentItemSchema, {
      invalid_type_error: "Invalid equipment item",
    })
    .default([]),

  // Logistics — private fields (only written by organizer, revealed to accepted DJ)
  arrivalInstructions: z.string().max(2000).optional().nullable(),
  setupNotes: z.string().max(2000).optional().nullable(),
  organizerContactName: z.string().max(200).optional().nullable(),
  organizerContactPhone: z.string().max(50).optional().nullable(),
  organizerContactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .nullable(),
});

// ============================================================
// SHARED CROSS-FIELD REFINEMENT
// Called by createGigSchema and updateGigSchema (partial)
// ============================================================

function applyBudgetRefinements(
  data: {
    budgetType?: BudgetType | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
  },
  ctx: z.RefinementCtx,
) {
  if (data.budgetType === "RANGE") {
    if (data.budgetMin == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum budget is required when budget type is Range",
        path: ["budgetMin"],
      });
    }
    if (data.budgetMax == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum budget is required when budget type is Range",
        path: ["budgetMax"],
      });
    }
    if (
      data.budgetMin != null &&
      data.budgetMax != null &&
      data.budgetMin >= data.budgetMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum budget must be less than maximum budget",
        path: ["budgetMin"],
      });
    }
  }

  if (data.budgetType === "FIXED" && data.budgetMin == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Budget amount is required when budget type is Fixed",
      path: ["budgetMin"],
    });
  }
}

function applyDeadlineRefinement(
  data: { eventDate?: string | null; applicationDeadline?: string | null },
  ctx: z.RefinementCtx,
) {
  if (data.applicationDeadline && data.eventDate) {
    if (new Date(data.applicationDeadline) >= new Date(data.eventDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Application deadline must be before the event date",
        path: ["applicationDeadline"],
      });
    }
  }
}

// ============================================================
// CREATE GIG SCHEMA
// All fields validated. eventDate must be in the future.
// ============================================================

export const createGigSchema = gigBaseShape.superRefine((data, ctx) => {
  if (new Date(data.eventDate) <= new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Event date must be in the future",
      path: ["eventDate"],
    });
  }
  applyDeadlineRefinement(data, ctx);
  applyBudgetRefinements(data, ctx);
});

// ============================================================
// UPDATE GIG SCHEMA
// All fields optional — only provided fields are validated.
// Suitable for partial saves (draft editing).
// ============================================================

export const updateGigSchema = gigBaseShape
  .partial()
  .superRefine((data, ctx) => {
    if (data.eventDate && new Date(data.eventDate) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event date must be in the future",
        path: ["eventDate"],
      });
    }
    applyDeadlineRefinement(data, ctx);
    applyBudgetRefinements(data, ctx);
  });

// ============================================================
// PUBLISH GIG SCHEMA
// Partial like updateGig but enforces required fields that
// must be present before a gig can be published.
// Called server-side inside the publishGig action.
// ============================================================

export const publishGigSchema = gigBaseShape
  .partial()
  .superRefine((data, ctx) => {
    // Required fields for publish
    if (!data.title || data.title.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A title of at least 5 characters is required to publish",
        path: ["title"],
      });
    }
    if (!data.gigType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gig type is required to publish",
        path: ["gigType"],
      });
    }
    if (!data.eventDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event date is required to publish",
        path: ["eventDate"],
      });
    } else if (new Date(data.eventDate) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event date must be in the future",
        path: ["eventDate"],
      });
    }
    if (!data.countryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Country is required to publish",
        path: ["countryId"],
      });
    }
    if (!data.cityId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required to publish",
        path: ["cityId"],
      });
    }
    applyDeadlineRefinement(data, ctx);
    applyBudgetRefinements(data, ctx);
  });

// ============================================================
// APPLY TO GIG SCHEMA
// Used by the DJ when submitting an application.
// ============================================================

export const applyToGigSchema = z.object({
  gigId: z.number().int().positive("Invalid gig"),
  message: z
    .string()
    .max(1000, "Message must be at most 1000 characters")
    .optional(),
});

// ============================================================
// UPDATE APPLICATION STATUS SCHEMA
// Used by the organizer to shortlist / accept / reject.
// ============================================================

export const updateApplicationStatusSchema = z.object({
  applicationId: z.number().int().positive("Invalid application"),
  status: z.enum(["SHORTLISTED", "ACCEPTED", "REJECTED"]),
});

// ============================================================
// INFERRED TYPES
// ============================================================

export type CreateGigInput = z.infer<typeof createGigSchema>;
export type UpdateGigInput = z.infer<typeof updateGigSchema>;
export type ApplyToGigInput = z.infer<typeof applyToGigSchema>;
export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;
