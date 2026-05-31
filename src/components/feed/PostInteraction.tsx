"use client";

import { switchLike } from "@/lib/actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOptimistic, useState } from "react";

const PostInteraction = ({
  postId,
  likes,
  commentNumber,
  currentUserId,
}: {
  postId: number;
  likes: string[];
  commentNumber: number;
  currentUserId?: string;
}) => {
  const router = useRouter();

  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: currentUserId ? likes.includes(currentUserId) : false,
  });

  const [optimisticLike, switchOptimisticLike] = useOptimistic(
    likeState,
    (state, value) => {
      return {
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      };
    },
  );

  const likeAction = async () => {
    if (!currentUserId) {
      router.push("/sign-in");
      return;
    }
    switchOptimisticLike("");
    try {
      await switchLike(postId);
      setLikeState((state) => ({
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      }));
    } catch (err) {
      switchOptimisticLike("");
    }
  };

  return (
    <div className="flex items-center justify-between text-sm my-4">
      <div className="flex gap-8">
        <div className="flex items-center gap-2 p-2 rounded-xl">
          <form action={likeAction}>
            <button title={!currentUserId ? "Sign in to like" : ""}>
              <Image
                src={optimisticLike.isLiked ? "/liked.png" : "/like.png"}
                width={16}
                height={16}
                alt=""
                className="cursor-pointer"
              />
            </button>
          </form>
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">
            {optimisticLike.likeCount}
            <span className="hidden md:inline"> Likes</span>
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl">
          <Image
            src="/comment.png"
            width={16}
            height={16}
            alt=""
            className="cursor-pointer"
          />
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">
            {commentNumber}
            <span className="hidden md:inline"> Comments</span>
          </span>
        </div>
      </div>
      {/* <div className="">
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
          <Image
            src="/share.png"
            width={16}
            height={16}
            alt=""
            className="cursor-pointer"
          />
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">
            <span className="hidden md:inline"> Share</span>
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default PostInteraction;
