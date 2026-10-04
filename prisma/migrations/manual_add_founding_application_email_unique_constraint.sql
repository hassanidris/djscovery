-- Migration: Add partial unique index on FoundingApplication email for PENDING/APPROVED status
-- Created: 2026-10-04
-- Purpose: Ensure one email can only have one PENDING or APPROVED founding application
-- This prevents duplicate applications while allowing reapplication after REJECTED/WITHDRAWN
-- Uses a partial unique index (PostgreSQL feature) to enforce uniqueness only for specific statuses

-- Step 1: Check for existing PENDING/APPROVED applications with duplicate emails
-- This shows which applications would conflict with the new constraint
SELECT email, status, COUNT(*) as count, array_agg(id ORDER BY id) as duplicate_ids
FROM "FoundingApplication"
WHERE status IN ('PENDING', 'APPROVED')
GROUP BY email, status
HAVING COUNT(*) > 1;

-- Step 2: Resolve duplicate PENDING applications for the same email
-- Keep the most recent one (highest ID) and mark older ones as WITHDRAWN
WITH duplicate_pending AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id DESC) as rn
  FROM "FoundingApplication"
  WHERE status = 'PENDING'
)
UPDATE "FoundingApplication"
SET status = 'WITHDRAWN',
    "updatedAt" = NOW()
WHERE id IN (SELECT id FROM duplicate_pending WHERE rn > 1);

-- Step 3: Resolve duplicate APPROVED applications for the same email
-- This should not happen in practice, but if it does, keep the most recent one
WITH duplicate_approved AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id DESC) as rn
  FROM "FoundingApplication"
  WHERE status = 'APPROVED'
)
UPDATE "FoundingApplication"
SET status = 'WITHDRAWN',
    "updatedAt" = NOW()
WHERE id IN (SELECT id FROM duplicate_approved WHERE rn > 1);

-- Step 4: Create the partial unique index
-- This ensures email is unique only when status is PENDING or APPROVED
CREATE UNIQUE INDEX "FoundingApplication_email_status_unique"
ON "FoundingApplication" (email)
WHERE status IN ('PENDING', 'APPROVED');

-- Step 5: Verify the index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'FoundingApplication'
  AND indexname = 'FoundingApplication_email_status_unique';

-- Step 6: Verify no duplicate PENDING/APPROVED applications remain
SELECT email, status, COUNT(*) as count
FROM "FoundingApplication"
WHERE status IN ('PENDING', 'APPROVED')
GROUP BY email, status
HAVING COUNT(*) > 1;
-- This should return 0 rows if successful
