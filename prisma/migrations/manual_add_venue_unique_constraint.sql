-- Migration: Add unique constraint on Venue (name, cityId) with deduplication
-- Created: 2026-08-03
-- Purpose: Ensure no duplicate venues exist by name and city before adding constraint
-- This migration should be run during a maintenance window with traffic disabled
-- The deduplication and constraint creation are wrapped in a transaction for atomicity

-- Step 1: Identify duplicate venues by name and cityId
-- This shows which venues would conflict with the new unique constraint
SELECT "name", "cityId", COUNT(*) as count, array_agg(id ORDER BY id) as duplicate_ids
FROM "Venue"
GROUP BY "name", "cityId"
HAVING COUNT(*) > 1;

-- Begin transaction for the deduplication and constraint creation
BEGIN;

-- Step 2: Create a temporary table to track canonical venue IDs
-- The canonical venue is the one with the lowest ID in each duplicate group
CREATE TEMP TABLE venue_canonical AS
SELECT MIN(id) as canonical_id, "name", "cityId"
FROM "Venue"
GROUP BY "name", "cityId"
HAVING COUNT(*) > 1;

-- Step 3: Remap dependent records to canonical venues
-- Remap VenueReview records
UPDATE "VenueReview"
SET "venueId" = vc.canonical_id
FROM venue_canonical vc
WHERE "VenueReview"."venueId" IN (
  SELECT id FROM "Venue" v
  JOIN venue_canonical vc ON v."name" = vc."name" AND v."cityId" = vc."cityId"
  AND v.id != vc.canonical_id
);

-- Remap VenueReputationScore records
UPDATE "VenueReputationScore"
SET "venueId" = vc.canonical_id
FROM venue_canonical vc
WHERE "VenueReputationScore"."venueId" IN (
  SELECT id FROM "Venue" v
  JOIN venue_canonical vc ON v."name" = vc."name" AND v."cityId" = vc."cityId"
  AND v.id != vc.canonical_id
);

-- Step 4: Delete duplicate venues (keeping only the canonical one)
DELETE FROM "Venue"
WHERE id IN (
  SELECT v.id FROM "Venue" v
  JOIN venue_canonical vc ON v."name" = vc."name" AND v."cityId" = vc."cityId"
  AND v.id != vc.canonical_id
);

-- Step 5: Drop temporary table
DROP TABLE venue_canonical;

-- Step 6: Add the unique constraint
-- Note: This is created without CONCURRENTLY, so it will briefly block writes.
-- This is acceptable because the entire script is executed as one block during a maintenance window.
ALTER TABLE "Venue"
ADD CONSTRAINT "Venue_name_cityId_key"
UNIQUE ("name", "cityId");

-- Commit the transaction
COMMIT;

-- Step 7: Verify no duplicates remain
SELECT "name", "cityId", COUNT(*) as count
FROM "Venue"
GROUP BY "name", "cityId"
HAVING COUNT(*) > 1;
-- This should return 0 rows if successful
