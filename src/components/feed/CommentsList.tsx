"use client";

import { addPostComment } from "@/lib/actions";
import { useUser } from "@/lib/supabase/useUser";
import { toast } from "sonner";
import { PostComment, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState } from "react";

type ReplyPreview = {
  id: number;
  content: string;
  user: Pick<User, "username" | "image">;
};
type CommentWithUser = PostComment & { user: User; replies?: ReplyPreview[] };

const CommentsList = ({
  comments,
  postId,
}: {
  comments: CommentWithUser[];
  postId: number;
}) => {
  const { isLoaded, user } = useUser();
  const [commentState, setCommentState] = useState(comments);
  const [text, setText] = useState("");

  const add = async () => {
    if (!user || !text) return;

    addOptimisticComment({
      id: Math.random(),
      content: text,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      userId: user.id,
      postId,
      parentId: null,
      user: {
        id: user.id,
        username: "Sending...",
        email: user.email ?? "",
        name: null,
        image: null,
        status: "ACTIVE",
        countryId: null,
        cityId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    });
    try {
      const created = await addPostComment(postId, text);
      setCommentState((prev) => [created, ...prev]);
      setText("");
    } catch {
      toast.error("Comment failed. Please try again.");
    }
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state],
  );

  return (
    <>
      {user ? (
        <div className="flex items-center gap-4">
          <Image
            src="/noAvatar.png"
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full ring-1 ring-gray-400"
          />
          <form
            action={add}
            className="flex flex-1 items-center justify-between bg-transparent ring-1 ring-gray-300 rounded-xl text-sm px-6 py-2 w-full"
          >
            <input
              type="text"
              placeholder="Write a comment ..."
              className="bg-transparent outline-none flex-1 text-h_white"
              onChange={(e) => setText(e.target.value)}
            />
            <Image
              src="/emoji.png"
              alt=""
              width={16}
              height={16}
              className="cursor-pointer"
            />
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Image
            src="/noAvatar.png"
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full ring-1 ring-gray-600 opacity-40 shrink-0"
          />
          <Link
            href="/sign-up"
            className="flex-1 flex items-center justify-between bg-transparent ring-1 ring-gray-700 rounded-xl px-4 py-2 group hover:ring-h_red/50 transition-all"
          >
            <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
              Sign up to join the conversation...
            </span>
            <span className="text-xs text-h_red font-semibold shrink-0 ml-3">
              Sign Up →
            </span>
          </Link>
        </div>
      )}
      <div className="">
        {optimisticComments.map((comment) => (
          <div className="flex gap-4 justify-between mt-6" key={comment.id}>
            <Link href={`/profile/${comment.user.username}`}>
              <Image
                src="/noAvatar.png"
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full ring-1 ring-gray-400"
              />
            </Link>
            <div className="flex flex-col gap-2 flex-1">
              <Link href={`/profile/${comment.user.username}`}>
                <span className="font-medium text-h_white">
                  {comment.user.username}
                </span>
              </Link>
              <p className="font-normal text-sm text-h_white">
                {comment.content}
              </p>
              <div className="flex items-center gap-8 text-xs text-gray-500 mt-2">
                <div>Reply</div>
              </div>
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 flex flex-col gap-3 pl-4 border-l border-gray-700/60">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 items-start">
                      <Image
                        src={reply.user.image ?? "/noAvatar.png"}
                        alt=""
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full ring-1 ring-gray-600 shrink-0"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-gray-300">
                          {reply.user.username}
                        </span>
                        <p className="text-xs text-gray-400">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Image
              src="/more.png"
              alt=""
              width={16}
              height={16}
              className="cursor-pointer w-4 h-4"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentsList;
