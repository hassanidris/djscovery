-- Migration: Add review response system
-- Created: 2026-08-15
-- Purpose: Allow DJs to respond to reviews they receive

-- Step 1: Add response column to DjRating
ALTER TABLE "DjRating" ADD COLUMN IF NOT EXISTS "response" TEXT;
ALTER TABLE "DjRating" ADD COLUMN IF NOT EXISTS "respondedAt" TIMESTAMP(3);

-- Step 2: Add index for respondedAt for performance
CREATE INDEX IF NOT EXISTS "DjRating_respondedAt_idx" ON "DjRating"("respondedAt");
