-- CreateEnum
CREATE TYPE "DjType" AS ENUM ('CLUB', 'WEDDING', 'FESTIVAL', 'CORPORATE', 'BAR_LOUNGE');

-- CreateTable
CREATE TABLE "DjProfileType" (
    "djProfileId" INTEGER NOT NULL,
    "type" "DjType" NOT NULL,

    CONSTRAINT "DjProfileType_pkey" PRIMARY KEY ("djProfileId","type")
);

-- AddForeignKey
ALTER TABLE "DjProfileType" ADD CONSTRAINT "DjProfileType_djProfileId_fkey"
    FOREIGN KEY ("djProfileId") REFERENCES "DjProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
