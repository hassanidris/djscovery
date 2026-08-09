-- CreateEnum: ExperienceLevel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ExperienceLevel' AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE "ExperienceLevel" AS ENUM ('OPEN', 'BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL', 'EXPERT');
  END IF;
END
$$;

-- Ensure all expected labels are present (idempotent; safe if type pre-existed with fewer values)
ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'OPEN';
ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'BEGINNER';
ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'INTERMEDIATE';
ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'PROFESSIONAL';
ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'EXPERT';

-- AlterTable: Add experience fields to DjProfile
ALTER TABLE "DjProfile"
ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER,
ADD COLUMN IF NOT EXISTS "experienceLevel" "ExperienceLevel";
