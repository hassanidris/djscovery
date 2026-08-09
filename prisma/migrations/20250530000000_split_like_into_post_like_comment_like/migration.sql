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

-- Migrate existing likes only if the old Like table exists (guard for shadow DB)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Like'
  ) THEN
    INSERT INTO "PostLike" ("id", "createdAt", "userId", "postId")
    SELECT DISTINCT ON ("userId", "postId") "id", "createdAt", "userId", "postId"
    FROM "Like"
    WHERE "postId" IS NOT NULL
    ORDER BY "userId", "postId", "createdAt"
    ON CONFLICT DO NOTHING;

    PERFORM setval(pg_get_serial_sequence('"PostLike"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM "PostLike"), 1));

    INSERT INTO "CommentLike" ("id", "createdAt", "userId", "commentId")
    SELECT DISTINCT ON ("userId", "commentId") "id", "createdAt", "userId", "commentId"
    FROM "Like"
    WHERE "commentId" IS NOT NULL
    ORDER BY "userId", "commentId", "createdAt"
    ON CONFLICT DO NOTHING;

    PERFORM setval(pg_get_serial_sequence('"CommentLike"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM "CommentLike"), 1));
  END IF;
END $$;

-- Drop the old polymorphic Like table
DROP TABLE IF EXISTS "Like";

-- CreateIndex: one like per user per post
CREATE UNIQUE INDEX "PostLike_userId_postId_key" ON "PostLike"("userId", "postId");

-- CreateIndex: one like per user per comment
CREATE UNIQUE INDEX "CommentLike_userId_commentId_key" ON "CommentLike"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Post'
  ) THEN
    ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Comment'
  ) THEN
    ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
