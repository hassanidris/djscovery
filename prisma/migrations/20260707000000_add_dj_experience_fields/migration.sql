-- CreateEnum: ExperienceLevel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'experiencelevel' AND typnamespace = 'public'::regnamespace
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'experiencelevel' AND t.typnamespace = 'public'::regnamespace
    AND e.enumlabel IN ('OPEN', 'BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL', 'EXPERT')
  ) THEN
    CREATE TYPE "ExperienceLevel" AS ENUM ('OPEN', 'BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL', 'EXPERT');
  END IF;
END
$$;

-- AlterTable: Add experience fields to DjProfile
ALTER TABLE "DjProfile"
ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER,
ADD COLUMN IF NOT EXISTS "experienceLevel" "ExperienceLevel";
