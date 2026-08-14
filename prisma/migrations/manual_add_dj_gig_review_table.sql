-- Migration: Create DjGigReview table
-- Created: 2026-08-14
-- Purpose: DJ reviews of organizers/gigs they've completed.
--          djProfileId is the reviewer (the DJ), organizerId is the review subject (the organizer).
-- Run after: prisma db push (or prisma migrate) has synced the schema.
-- Then run: prisma/rls-policies.sql for RLS enforcement.

-- Step 1: Create the DjGigReview table
CREATE TABLE IF NOT EXISTS "DjGigReview" (
  "id"           SERIAL       PRIMARY KEY,
  "rating"       INTEGER      NOT NULL,
  "review"       TEXT,

  "gigId"        INTEGER      NOT NULL,
  "djProfileId"  INTEGER      NOT NULL,
  "organizerId"  TEXT         NOT NULL,

  -- Anti-gaming audit fields
  "ipAddress"    TEXT,
  "userAgent"    TEXT,

  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL
);

-- Step 2: Add foreign key constraints with CASCADE behavior
DO $$
BEGIN
  ALTER TABLE "DjGigReview"
    ADD CONSTRAINT "DjGigReview_gigId_fkey"
    FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "DjGigReview"
    ADD CONSTRAINT "DjGigReview_djProfileId_fkey"
    FOREIGN KEY ("djProfileId") REFERENCES "DjProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "DjGigReview"
    ADD CONSTRAINT "DjGigReview_organizerId_fkey"
    FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 3: Add unique constraint (one review per gig per DJ)
DO $$
BEGIN
  ALTER TABLE "DjGigReview"
    ADD CONSTRAINT "DjGigReview_gigId_djProfileId_key"
    UNIQUE ("gigId", "djProfileId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Step 4: Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS "DjGigReview_djProfileId_idx" ON "DjGigReview" ("djProfileId");
CREATE INDEX IF NOT EXISTS "DjGigReview_organizerId_idx" ON "DjGigReview" ("organizerId");
CREATE INDEX IF NOT EXISTS "DjGigReview_gigId_idx" ON "DjGigReview" ("gigId");
CREATE INDEX IF NOT EXISTS "DjGigReview_createdAt_idx" ON "DjGigReview" ("createdAt");

-- Step 5: Enable RLS and apply policies (mirrors prisma/rls-policies.sql for DjGigReview)
-- Server-side reads via Prisma bypass RLS; direct client SELECT is denied.
ALTER TABLE "DjGigReview" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read DJ gig reviews" ON "DjGigReview";
DROP POLICY IF EXISTS "No client read access to DJ gig reviews" ON "DjGigReview";
CREATE POLICY "No client read access to DJ gig reviews" ON "DjGigReview" FOR SELECT TO public USING (false);
DROP POLICY IF EXISTS "DJ can create own gig review" ON "DjGigReview";
CREATE POLICY "DJ can create own gig review" ON "DjGigReview" FOR INSERT TO public WITH CHECK (
  (auth.uid())::text = (
    SELECT "dj"."userId" FROM "DjProfile" dj
    WHERE dj.id = "DjGigReview"."djProfileId"
  )
  AND EXISTS (
    SELECT 1 FROM "GigApplication" ga
    JOIN "Hire" h ON h."applicationId" = ga.id
    WHERE ga."gigId" = "DjGigReview"."gigId"
      AND ga."djProfileId" = "DjGigReview"."djProfileId"
      AND ga.status = 'ACCEPTED'
      AND h.status = 'COMPLETED'
  )
);
DROP POLICY IF EXISTS "DJ can update own gig review" ON "DjGigReview";
CREATE POLICY "DJ can update own gig review" ON "DjGigReview" FOR UPDATE TO public USING (
  (auth.uid())::text = (
    SELECT "dj"."userId" FROM "DjProfile" dj
    WHERE dj.id = "DjGigReview"."djProfileId"
  )
);
DROP POLICY IF EXISTS "DJ can delete own gig review" ON "DjGigReview";
CREATE POLICY "DJ can delete own gig review" ON "DjGigReview" FOR DELETE TO public USING (
  (auth.uid())::text = (
    SELECT "dj"."userId" FROM "DjProfile" dj
    WHERE dj.id = "DjGigReview"."djProfileId"
  )
);
