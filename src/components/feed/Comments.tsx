import prisma from "@/lib/client";
import CommentsList from "./CommentsList";

const Comments = async ({
  postId,
  initialComments,
  currentUserId,
}: {
  postId: number;
  initialComments?: any[];
  currentUserId?: string;
}) => {
  let currentUserAvatarUrl: string | null = null;
  if (currentUserId) {
    try {
      const cu = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          image: true,
          djProfile: { select: { avatar: true } },
        },
      });
      currentUserAvatarUrl = cu?.djProfile?.avatar ?? cu?.image ?? null;
    } catch {}
  }

  const comments =
    initialComments ??
    (await prisma.postComment.findMany({
      where: { postId, deletedAt: null, parentId: null },
      include: {
        user: {
          include: {
            djProfile: {
              select: { avatar: true, stageName: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }));

  return (
    <div>
      <CommentsList
        comments={comments}
        postId={postId}
        currentUserAvatarUrl={currentUserAvatarUrl}
      />
    </div>
  );
};

export default Comments;
