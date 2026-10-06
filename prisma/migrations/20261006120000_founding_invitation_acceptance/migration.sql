ALTER TABLE "FoundingApplication"
ADD COLUMN "userId" TEXT;

ALTER TABLE "InvitationToken"
ADD COLUMN "foundingApplicationId" INTEGER,
ADD COLUMN "reminderSentAt" TIMESTAMP(3),
ADD COLUMN "expiredEmailSentAt" TIMESTAMP(3);

UPDATE "InvitationToken" AS invitation
SET "foundingApplicationId" = (
  SELECT application."id"
  FROM "FoundingApplication" AS application
  WHERE application."email" = invitation."email"
    AND application."status" = 'APPROVED'
    AND application."deletedAt" IS NULL
  ORDER BY application."reviewedAt" DESC NULLS LAST, application."submittedAt" DESC
  LIMIT 1
)
WHERE invitation."type" = 'FOUNDING_MEMBER'
  AND invitation."foundingApplicationId" IS NULL;

CREATE INDEX "FoundingApplication_userId_idx" ON "FoundingApplication"("userId");
CREATE INDEX "InvitationToken_foundingApplicationId_idx" ON "InvitationToken"("foundingApplicationId");
CREATE INDEX "InvitationToken_status_expiresAt_idx" ON "InvitationToken"("status", "expiresAt");

ALTER TABLE "FoundingApplication"
ADD CONSTRAINT "FoundingApplication_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InvitationToken"
ADD CONSTRAINT "InvitationToken_foundingApplicationId_fkey"
FOREIGN KEY ("foundingApplicationId") REFERENCES "FoundingApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
