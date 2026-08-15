-- Migration: Add review helpfulness voting system
-- Created: 2026-08-15
-- Purpose: Add helpfulness voting to DjRating to allow users to mark reviews as helpful

-- Step 1: Add helpfulCount column to DjRating
ALTER TABLE "DjRating" ADD COLUMN IF NOT EXISTS "helpfulCount" INTEGER DEFAULT 0;

-- Step 2: Create DjRatingHelpfulVote table
CREATE TABLE IF NOT EXISTS "DjRatingHelpfulVote" (
    id SERIAL PRIMARY KEY,
    "ratingId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DjRatingHelpfulVote_ratingId_fkey" 
        FOREIGN KEY ("ratingId") REFERENCES "DjRating"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DjRatingHelpfulVote_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 3: Add unique constraint for ratingId + userId (one vote per user per review)
ALTER TABLE "DjRatingHelpfulVote" 
ADD CONSTRAINT IF NOT EXISTS "DjRatingHelpfulVote_ratingId_userId_key" 
UNIQUE ("ratingId", "userId");

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS "DjRatingHelpfulVote_ratingId_idx" ON "DjRatingHelpfulVote"("ratingId");
CREATE INDEX IF NOT EXISTS "DjRatingHelpfulVote_userId_idx" ON "DjRatingHelpfulVote"("userId");
CREATE INDEX IF NOT EXISTS "DjRating_helpfulCount_idx" ON "DjRating"("helpfulCount");

-- Step 5: Add index to DjRating for helpfulCount
CREATE INDEX IF NOT EXISTS "DjRating_helpfulCount_idx" ON "DjRating"("helpfulCount");
