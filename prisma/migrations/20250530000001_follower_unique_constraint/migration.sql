-- CreateIndex: prevent duplicate follow edges
CREATE UNIQUE INDEX "Follower_followerId_followingId_key" ON "Follower"("followerId", "followingId");
