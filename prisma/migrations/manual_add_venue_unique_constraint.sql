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

-- Step 2.5: Resolve VenueReview uniqueness collisions before remapping
-- When duplicate venues are merged, a user may have reviewed the same event
-- at both venues, which would violate the (eventId, venueId, userId) unique constraint
-- We deterministically keep the review with the lowest ID and delete duplicates
WITH review_conflicts AS (
  SELECT
    vr1.id as keep_id,
    vr2.id as delete_id
  FROM "VenueReview" vr1
  JOIN "VenueReview" vr2 ON
    vr1."eventId" = vr2."eventId" AND
    vr1."userId" = vr2."userId" AND
    vr1.id < vr2.id
  JOIN "Venue" v1 ON vr1."venueId" = v1.id
  JOIN "Venue" v2 ON vr2."venueId" = v2.id
  JOIN venue_canonical vc ON
    v1."name" = vc."name" AND
    v1."cityId" = vc."cityId" AND
    v2."name" = vc."name" AND
    v2."cityId" = vc."cityId"
  WHERE v1.id != v2.id
)
DELETE FROM "VenueReview"
WHERE id IN (SELECT delete_id FROM review_conflicts);

-- Step 3: Remap dependent records to canonical venues
-- Remap VenueReview records
UPDATE "VenueReview" vr
SET "venueId" = vc.canonical_id
FROM venue_canonical vc
WHERE vr."venueId" IN (
  SELECT v.id FROM "Venue" v
  JOIN venue_canonical vc ON v."name" = vc."name" AND v."cityId" = vc."cityId"
  AND v.id != vc.canonical_id
);

-- Remap VenueReputationScore records
UPDATE "VenueReputationScore" vrs
SET "venueId" = vc.canonical_id
FROM venue_canonical vc
WHERE vrs."venueId" IN (
  SELECT v.id FROM "Venue" v
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

-- Step 6: Drop temporary table
DROP TABLE venue_canonical;

-- Step 7: Add the unique constraint
-- Note: This is created without CONCURRENTLY, so it will briefly block writes.
-- This is acceptable because the entire script is executed as one block during a maintenance window.
ALTER TABLE "Venue"
ADD CONSTRAINT "Venue_name_cityId_key"
UNIQUE ("name", "cityId");

-- Commit the transaction
COMMIT;

-- Step 8: Verify no duplicates remain
SELECT "name", "cityId", COUNT(*) as count
FROM "Venue"
GROUP BY "name", "cityId"
HAVING COUNT(*) > 1;
-- This should return 0 rows if successful
