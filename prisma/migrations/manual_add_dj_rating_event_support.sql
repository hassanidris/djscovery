-- Migration: Add event-anchored review support to DjRating
-- Created: 2026-08-03
-- Purpose: Extend DjRating to support both direct reviews and event-anchored reviews

-- Step 1: Add DjRatingType enum
DO $$
BEGIN
  CREATE TYPE "DjRatingType" AS ENUM ('DIRECT', 'EVENT_ATTENDEE', 'EVENT_ORGANIZER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add eventId and reviewType columns to DjRating
ALTER TABLE "DjRating" ADD COLUMN IF NOT EXISTS "eventId" INTEGER;
ALTER TABLE "DjRating" ADD COLUMN IF NOT EXISTS "reviewType" "DjRatingType";

-- Step 3: Add foreign key constraint for eventId
DO $$
BEGIN
  ALTER TABLE "DjRating"
    ADD CONSTRAINT "DjRating_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 4: Drop existing unique constraint (from previous schema)
ALTER TABLE "DjRating" DROP CONSTRAINT IF EXISTS "DjRating_userId_djProfileId_key";
ALTER TABLE "DjRating" DROP CONSTRAINT IF EXISTS "DjRating_userId_djProfileId_eventId_key";

-- Step 5: Add partial unique indexes for proper constraint enforcement
-- Direct reviews: one per user per DJ (eventId IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS "DjRating_userId_djProfileId_direct_unique"
  ON "DjRating" ("userId", "djProfileId")
  WHERE "eventId" IS NULL;

-- Event reviews: one per user per event per DJ (eventId IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS "DjRating_userId_djProfileId_eventId_event_unique"
  ON "DjRating" ("userId", "djProfileId", "eventId")
  WHERE "eventId" IS NOT NULL;

-- Step 6: Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS "DjRating_eventId_idx" ON "DjRating" ("eventId");
CREATE INDEX IF NOT EXISTS "DjRating_reviewType_idx" ON "DjRating" ("reviewType");
