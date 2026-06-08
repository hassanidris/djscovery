"use client";

import { switchFollow } from "@/lib/actions";
import { toast } from "sonner";
import { useOptimistic, useState, useTransition } from "react";
import { UserCheck, UserPlus } from "lucide-react";

const UserInfoCardInteraction = ({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [isPending, startTransition] = useTransition();

  const [optimisticFollowing, toggleOptimistic] = useOptimistic(
    following,
    (state) => !state,
  );

  const follow = () => {
    startTransition(async () => {
      toggleOptimistic(null);
      try {
        await switchFollow(userId);
        setFollowing((prev) => !prev);
      } catch {
        toggleOptimistic(null);
        toast.error("Couldn’t update follow. Try again.");
      }
    });
  };

  return (
    <form action={follow}>
      <button
        disabled={isPending}
        className={`w-full flex items-center justify-center gap-2 text-sm font-medium rounded-lg p-2 transition-all disabled:opacity-60 disabled:cursor-wait cursor-pointer ${
          optimisticFollowing
            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
            : "bg-h_red hover:bg-h_redDark text-white"
        }`}
      >
        {optimisticFollowing ? (
          <UserCheck className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {optimisticFollowing ? "Following" : "Follow"}
      </button>
    </form>
  );
};

export default UserInfoCardInteraction;
