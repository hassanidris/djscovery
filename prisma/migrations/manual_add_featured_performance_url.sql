-- Add featured performance fields to DjProfile for Premium DJs
ALTER TABLE "DjProfile"
  ADD COLUMN IF NOT EXISTS "featuredPerformanceUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "featuredPerformanceContext" TEXT;
