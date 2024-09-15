import prisma from "@/lib/client";
import Image from "next/image";
import CommentsList from "./CommentsList";

const Comments = async ({ postId }: { postId: number }) => {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
    },
    include: {
      user: true,
    },
  });
  return (
    <div className="">
      {/* Field */}
      <CommentsList comments={comments} postId={postId} />
    </div>
  );
};

export default Comments;
