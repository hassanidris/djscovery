-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'DjType' AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE "DjType" AS ENUM ('CLUB', 'WEDDING', 'FESTIVAL', 'CORPORATE', 'BAR_LOUNGE', 'PRIVATE_PARTY', 'BIRTHDAY', 'CULTURAL_EVENT');
  END IF;
END
$$;

-- Ensure all expected labels are present (idempotent; safe if type pre-existed with fewer values)
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'CLUB';
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'WEDDING';
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'FESTIVAL';
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'CORPORATE';
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'BAR_LOUNGE';
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'PRIVATE_PARTY';
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'BIRTHDAY';
ALTER TYPE "DjType" ADD VALUE IF NOT EXISTS 'CULTURAL_EVENT';

-- CreateTable
CREATE TABLE "DjProfileType" (
    "djProfileId" INTEGER NOT NULL,
    "type" "DjType" NOT NULL,

    CONSTRAINT "DjProfileType_pkey" PRIMARY KEY ("djProfileId","type")
);

-- AddForeignKey
ALTER TABLE "DjProfileType" ADD CONSTRAINT "DjProfileType_djProfileId_fkey"
    FOREIGN KEY ("djProfileId") REFERENCES "DjProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
