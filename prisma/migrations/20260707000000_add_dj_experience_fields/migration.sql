-- CreateEnum: ExperienceLevel
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'experiencelevel'
  ) THEN
    CREATE TYPE "ExperienceLevel" AS ENUM ('OPEN', 'BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL', 'EXPERT');
  END IF;
END
$$;

-- AlterTable: Add experience fields to DjProfile
ALTER TABLE "DjProfile"
ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER,
ADD COLUMN IF NOT EXISTS "experienceLevel" "ExperienceLevel";
