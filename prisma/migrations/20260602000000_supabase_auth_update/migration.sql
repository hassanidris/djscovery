-- ============================================================
-- Auth Update Migration — idempotent, safe to re-run
-- Apply in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Drop the role column from User (FAN is implicit — no longer stored)
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- 2. Drop FanProfile table (location moves to User.countryId/cityId)
DROP TABLE IF EXISTS "FanProfile" CASCADE;

-- 3. Drop UserRole if it exists from a previous partial run (recreated below)
DROP TABLE IF EXISTS "UserRole" CASCADE;

-- 4. Handle Role enum: remove FAN value
--    PostgreSQL cannot remove enum values directly — recreate the type.
DO $$
BEGIN
  -- Only recreate if FAN still exists in the enum
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'Role' AND e.enumlabel = 'FAN'
  ) THEN
    CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'DJ', 'ORGANIZER');
    -- CASCADE removes any remaining dependencies on the old enum
    DROP TYPE "Role" CASCADE;
    ALTER TYPE "Role_new" RENAME TO "Role";
  ELSE
    -- FAN already removed; ensure Role type exists at all
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
      CREATE TYPE "Role" AS ENUM ('ADMIN', 'DJ', 'ORGANIZER');
    END IF;
  END IF;
END $$;

-- 5. Add optional profile fields to User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "name"      TEXT,
  ADD COLUMN IF NOT EXISTS "image"     TEXT,
  ADD COLUMN IF NOT EXISTS "countryId" INTEGER,
  ADD COLUMN IF NOT EXISTS "cityId"    INTEGER;

-- 6. Add FK constraints for User → Country / City (guarded)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_countryId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_countryId_fkey"
      FOREIGN KEY ("countryId") REFERENCES "Country"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_cityId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_cityId_fkey"
      FOREIGN KEY ("cityId") REFERENCES "City"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 7. Indexes on User
CREATE INDEX IF NOT EXISTS "User_countryId_idx" ON "User"("countryId");
CREATE INDEX IF NOT EXISTS "User_cityId_idx"    ON "User"("cityId");
DROP INDEX   IF EXISTS "User_role_idx";

-- 8. Create UserRole table (DJ / ORGANIZER / ADMIN only — FAN is implicit)
CREATE TABLE "UserRole" (
  "id"     SERIAL  NOT NULL,
  "userId" TEXT    NOT NULL,
  "role"   "Role"  NOT NULL,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");
CREATE INDEX        "UserRole_userId_idx"      ON "UserRole"("userId");
CREATE INDEX        "UserRole_role_idx"        ON "UserRole"("role");

ALTER TABLE "UserRole"
  ADD CONSTRAINT "UserRole_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
