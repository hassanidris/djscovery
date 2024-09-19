"use client";

import { addComment } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Comment, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState } from "react";

type CommentWithUser = Comment & { user: User };

const CommentsList = ({
  comments,
  postId,
}: {
  comments: CommentWithUser[];
  postId: number;
}) => {
  const { isLoaded, user } = useUser();
  const [commentState, setCommentState] = useState(comments);
  const [desc, setDesc] = useState("");

  // if (!isLoaded) {
  //   return "Loading...";
  // }

  const add = async () => {
    if (!user || !desc) return;

    addOptimisticComment({
      id: Math.random(),
      desc,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: user.id,
      postId: postId,
      user: {
        id: user.id,
        username: "Sending Please Wait...",
        avatar: user.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        country: "",
        stageName: "Dj. Has",
        genres: "Hip hop, Techno, RnB, ....",
        createdAt: new Date(Date.now()),
      },
    });
    try {
      const createdComment = await addComment(postId, desc);
      setCommentState((prev) => [createdComment, ...prev]);
    } catch (err) {}
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state]
  );
  return (
    <>
      {user && (
        <div className=" flex items-center gap-4">
          <Image
            src={user?.imageUrl || "/noAvatar"}
            alt=""
            width={32}
            height={32}
            className=" w-8 h-8 rounded-full ring-1 ring-gray-400"
          />
          <form
            action={add}
            className=" flex flex-1 items-center justify-between bg-transparent ring-1 ring-gray-300 rounded-xl text-sm px-6 py-2 w-full"
          >
            <input
              type="text"
              placeholder="Write a comment ..."
              className=" bg-transparent outline-none flex-1 text-h_white"
              onChange={(e) => setDesc(e.target.value)}
            />
            <Image
              src="/emoji.png"
              alt=""
              width={16}
              height={16}
              className=" cursor-pointer"
            />
          </form>
        </div>
      )}
      {/* comments listing */}
      <div className="">
        {/* Comment */}
        {optimisticComments.map((comment) => (
          <div className=" flex gap-4 justify-between mt-6" key={comment.id}>
            {/* Avatar */}
            <Link href={`/profile/${comment.user.username}`}>
              <Image
                src={comment.user.avatar || "/noAvatar"}
                alt=""
                width={40}
                height={40}
                className=" w-10 h-10 rounded-full ring-1 ring-gray-400"
              />
            </Link>
            {/* Desc */}
            <div className=" flex flex-col gap-2 flex-1">
              <Link href={`/profile/${comment.user.username}`}>
                <span className=" font-medium text-h_white">
                  {comment.user.name && comment.user.surname
                    ? comment.user.name + " " + comment.user.surname
                    : comment.user.username}
                </span>
              </Link>
              <p className=" font-normal text-sm text-h_white">
                {comment.desc}
              </p>
              <div className=" flex items-center gap-8 text-xs text-gray-500 mt-2">
                {/* <div className=" flex items-center gap-4">
                  <Image
                    src="/like.png"
                    alt=""
                    width={12}
                    height={12}
                    className=" cursor-pointer w-3 h-3"
                  />
                  <span className=" text-gray-300">|</span>
                  <span className=" text-gray-500">123 Likes</span>
                </div> */}
                <div className="f">Reply</div>
              </div>
            </div>
            {/* Icon */}
            <Image
              src="/more.png"
              alt=""
              width={16}
              height={16}
              className=" cursor-pointer w-4 h-4"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentsList;
