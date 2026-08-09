-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'djtype' AND typnamespace = 'public'::regnamespace
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'djtype' AND t.typnamespace = 'public'::regnamespace
    AND e.enumlabel IN ('CLUB', 'WEDDING', 'FESTIVAL', 'CORPORATE', 'BAR_LOUNGE', 'PRIVATE_PARTY', 'BIRTHDAY', 'CULTURAL_EVENT')
  ) THEN
    CREATE TYPE "DjType" AS ENUM ('CLUB', 'WEDDING', 'FESTIVAL', 'CORPORATE', 'BAR_LOUNGE', 'PRIVATE_PARTY', 'BIRTHDAY', 'CULTURAL_EVENT');
  END IF;
END
$$;

-- CreateTable
CREATE TABLE "DjProfileType" (
    "djProfileId" INTEGER NOT NULL,
    "type" "DjType" NOT NULL,

    CONSTRAINT "DjProfileType_pkey" PRIMARY KEY ("djProfileId","type")
);

-- AddForeignKey
ALTER TABLE "DjProfileType" ADD CONSTRAINT "DjProfileType_djProfileId_fkey"
    FOREIGN KEY ("djProfileId") REFERENCES "DjProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
