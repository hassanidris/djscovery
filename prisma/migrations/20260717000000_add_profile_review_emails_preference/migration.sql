-- Add profileReviewEmails preference field to EmailPreference
-- (DJ profile approved/rejected email notifications toggle)
ALTER TABLE "EmailPreference"
  ADD COLUMN IF NOT EXISTS "profileReviewEmails" BOOLEAN NOT NULL DEFAULT true;
