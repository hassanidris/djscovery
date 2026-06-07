import prisma from "@/lib/client";
import CommentsList from "./CommentsList";

const Comments = async ({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments?: any[];
}) => {
  const comments =
    initialComments ??
    (await prisma.postComment.findMany({
      where: { postId, deletedAt: null, parentId: null },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }));
  return (
    <div className="">
      <CommentsList comments={comments} postId={postId} />
    </div>
  );
};

export default Comments;
