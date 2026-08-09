-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'djtype'
  ) THEN
    CREATE TYPE "DjType" AS ENUM ('CLUB', 'WEDDING', 'FESTIVAL', 'CORPORATE', 'BAR_LOUNGE');
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
