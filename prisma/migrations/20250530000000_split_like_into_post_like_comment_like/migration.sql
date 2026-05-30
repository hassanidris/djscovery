-- CreateTable: PostLike (postId is NOT NULL — enforces exactly one target)
CREATE TABLE "PostLike" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CommentLike (commentId is NOT NULL — enforces exactly one target)
CREATE TABLE "CommentLike" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,
    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- Migrate existing post likes (only rows where postId is set)
INSERT INTO "PostLike" ("id", "createdAt", "userId", "postId")
SELECT "id", "createdAt", "userId", "postId"
FROM "Like"
WHERE "postId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Migrate existing comment likes (only rows where commentId is set)
INSERT INTO "CommentLike" ("id", "createdAt", "userId", "commentId")
SELECT "id", "createdAt", "userId", "commentId"
FROM "Like"
WHERE "commentId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Drop the old polymorphic Like table
DROP TABLE IF EXISTS "Like";

-- CreateIndex: one like per user per post
CREATE UNIQUE INDEX "PostLike_userId_postId_key" ON "PostLike"("userId", "postId");

-- CreateIndex: one like per user per comment
CREATE UNIQUE INDEX "CommentLike_userId_commentId_key" ON "CommentLike"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
