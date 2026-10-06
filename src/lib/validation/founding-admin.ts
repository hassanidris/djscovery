import { z } from "zod";

export const FOUNDING_APPLICATION_STATUSES = [
  "PENDING",
  "EMAIL_VERIFIED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
  "COMPLETED",
] as const;

export const FoundingApplicationIdSchema = z.object({
  applicationId: z.coerce.number().int().positive("Invalid application ID"),
});

export const FoundingApplicationStatusChangeSchema =
  FoundingApplicationIdSchema.extend({
    status: z.enum(FOUNDING_APPLICATION_STATUSES),
    note: z.string().trim().max(2000, "Note must be 2000 characters or fewer"),
    reason: z
      .string()
      .trim()
      .max(1000, "Reason must be 1000 characters or fewer"),
  }).superRefine((value, context) => {
    if (value.status === "REJECTED" && value.reason.length < 3) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "A rejection reason of at least 3 characters is required",
      });
    }
  });

export const FoundingApplicationNotesSchema =
  FoundingApplicationIdSchema.extend({
    notes: z
      .string()
      .trim()
      .max(5000, "Notes must be 5000 characters or fewer"),
  });

export type FoundingApplicationStatusChange = z.infer<
  typeof FoundingApplicationStatusChangeSchema
>;
