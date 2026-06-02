"use client";

import { addPostComment } from "@/lib/actions";
import { useUser } from "@/lib/supabase/useUser";
import { PostComment, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState } from "react";

type CommentWithUser = PostComment & { user: User };

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
    } catch {
      //
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
        <Link
          href="/sign-in"
          className="text-xs text-gray-500 hover:text-h_red transition-colors"
        >
          Sign in to leave a comment →
        </Link>
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
