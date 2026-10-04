import { z } from "zod";

// ── Users ────────────────────────────────────────────────────

export const SuspendUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  reason: z.string().max(500).optional(),
});

export const ActivateUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

// ── DJ Profiles ──────────────────────────────────────────────

export const ApproveDjSchema = z.object({
  djProfileId: z.coerce.number().int().positive("Invalid DJ profile ID"),
});

export const RejectDjSchema = z.object({
  djProfileId: z.coerce.number().int().positive("Invalid DJ profile ID"),
  reason: z.string().max(500).optional(),
});

export const HideDjSchema = z.object({
  djProfileId: z.coerce.number().int().positive("Invalid DJ profile ID"),
});

export const UnhideDjSchema = z.object({
  djProfileId: z.coerce.number().int().positive("Invalid DJ profile ID"),
});

export const SuspendDjAccountSchema = z.object({
  djProfileId: z.coerce.number().int().positive("Invalid DJ profile ID"),
  reason: z.string().max(500).optional(),
});

// ── Organizers ───────────────────────────────────────────────

export const HideOrganizerSchema = z.object({
  organizerProfileId: z.coerce
    .number()
    .int()
    .positive("Invalid organizer profile ID"),
});

export const UnhideOrganizerSchema = z.object({
  organizerProfileId: z.coerce
    .number()
    .int()
    .positive("Invalid organizer profile ID"),
});

export const SuspendOrganizerSchema = z.object({
  organizerProfileId: z.coerce
    .number()
    .int()
    .positive("Invalid organizer profile ID"),
  reason: z.string().max(500).optional(),
});

// ── Gigs ─────────────────────────────────────────────────────

export const HideGigSchema = z.object({
  gigId: z.coerce.number().int().positive("Invalid gig ID"),
});

export const UnhideGigSchema = z.object({
  gigId: z.coerce.number().int().positive("Invalid gig ID"),
});

export const CloseGigSchema = z.object({
  gigId: z.coerce.number().int().positive("Invalid gig ID"),
  reason: z.string().max(500).optional(),
});

// ── Reports ──────────────────────────────────────────────────

export const MarkReportUnderReviewSchema = z.object({
  reportId: z.coerce.number().int().positive("Invalid report ID"),
});

export const ResolveReportSchema = z.object({
  reportId: z.coerce.number().int().positive("Invalid report ID"),
  adminNote: z.string().max(1000).optional(),
});

export const DismissReportSchema = z.object({
  reportId: z.coerce.number().int().positive("Invalid report ID"),
  adminNote: z.string().max(1000).optional(),
});

// ── Hires ───────────────────────────────────────────────────

export const MarkHireCompletedSchema = z.object({
  hireId: z.coerce.number().int().positive("Invalid hire ID"),
});

export const MarkHireNoShowSchema = z.object({
  hireId: z.coerce.number().int().positive("Invalid hire ID"),
});

export const CancelHireSchema = z.object({
  hireId: z.coerce.number().int().positive("Invalid hire ID"),
  reason: z.string().max(500).optional(),
});

export const UpdateHireNotesSchema = z.object({
  hireId: z.coerce.number().int().positive("Invalid hire ID"),
  notes: z.string().max(2000).optional(),
});

// ── Inferred types ───────────────────────────────────────────

export type SuspendUserInput = z.infer<typeof SuspendUserSchema>;
export type ActivateUserInput = z.infer<typeof ActivateUserSchema>;
export type ApproveDjInput = z.infer<typeof ApproveDjSchema>;
export type RejectDjInput = z.infer<typeof RejectDjSchema>;
export type HideDjInput = z.infer<typeof HideDjSchema>;
export type UnhideDjInput = z.infer<typeof UnhideDjSchema>;
export type SuspendDjAccountInput = z.infer<typeof SuspendDjAccountSchema>;
export type HideOrganizerInput = z.infer<typeof HideOrganizerSchema>;
export type UnhideOrganizerInput = z.infer<typeof UnhideOrganizerSchema>;
export type SuspendOrganizerInput = z.infer<typeof SuspendOrganizerSchema>;
export type HideGigInput = z.infer<typeof HideGigSchema>;
export type UnhideGigInput = z.infer<typeof UnhideGigSchema>;
export type CloseGigInput = z.infer<typeof CloseGigSchema>;
export type MarkReportUnderReviewInput = z.infer<
  typeof MarkReportUnderReviewSchema
>;
export type ResolveReportInput = z.infer<typeof ResolveReportSchema>;
export type DismissReportInput = z.infer<typeof DismissReportSchema>;
export type MarkHireCompletedInput = z.infer<typeof MarkHireCompletedSchema>;
export type MarkHireNoShowInput = z.infer<typeof MarkHireNoShowSchema>;
export type CancelHireInput = z.infer<typeof CancelHireSchema>;
export type UpdateHireNotesInput = z.infer<typeof UpdateHireNotesSchema>;
