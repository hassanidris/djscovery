"use client";

import { switchLike } from "@/lib/actions";
import { toast } from "sonner";
import { Heart, MessageCircle } from "lucide-react";
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
    } catch {
      switchOptimisticLike("");
      toast.error("Action failed. Try again.");
    }
  };

  return (
    <div className="flex items-center gap-6 text-sm">
      <form action={likeAction}>
        <button
          title={!currentUserId ? "Sign in to like" : ""}
          className="flex items-center gap-1.5 group cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              optimisticLike.isLiked
                ? "fill-h_red text-h_red"
                : "text-gray-500 group-hover:text-h_red"
            }`}
          />
          <span className="text-gray-500 group-hover:text-gray-300 transition-colors text-xs">
            {optimisticLike.likeCount}
            <span className="hidden sm:inline"> Likes</span>
          </span>
        </button>
      </form>
      <div className="flex items-center gap-1.5 text-gray-500">
        <MessageCircle className="w-4 h-4" />
        <span className="text-xs">
          {commentNumber}
          <span className="hidden sm:inline"> Comments</span>
        </span>
      </div>
    </div>
  );
};

export default PostInteraction;
