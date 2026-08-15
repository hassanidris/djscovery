-- Add ReviewNotificationTracking table for tracking review notifications
-- This prevents spam by tracking which users have been notified about review opportunities
-- and supports "remind me later" functionality

CREATE TABLE "ReviewNotificationTracking" (
    "id" SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remindedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewNotificationTracking_userId_targetType_targetId_key" UNIQUE ("userId", "targetType", "targetId"),
    CONSTRAINT "ReviewNotificationTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX "ReviewNotificationTracking_userId_idx" ON "ReviewNotificationTracking"("userId");
CREATE INDEX "ReviewNotificationTracking_targetType_targetId_idx" ON "ReviewNotificationTracking"("targetType", "targetId");
