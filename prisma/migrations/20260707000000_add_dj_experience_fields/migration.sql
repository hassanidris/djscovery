-- CreateEnum: ExperienceLevel
CREATE TYPE "ExperienceLevel" AS ENUM ('OPEN', 'BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL', 'EXPERT');

-- AlterTable: Add experience fields to DjProfile
ALTER TABLE "DjProfile"
ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER,
ADD COLUMN IF NOT EXISTS "experienceLevel" "ExperienceLevel";
