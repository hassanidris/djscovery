import prisma from "@/lib/client";
import CommentsList from "./CommentsList";

const Comments = async ({ postId }: { postId: number }) => {
  const comments = await prisma.postComment.findMany({
    where: { postId, deletedAt: null, parentId: null },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="">
      <CommentsList comments={comments} postId={postId} />
    </div>
  );
};

export default Comments;
