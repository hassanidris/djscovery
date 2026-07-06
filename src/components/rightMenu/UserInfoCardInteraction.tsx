"use client";

import { switchFollow } from "@/lib/actions/user-follows";
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
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 text-sm font-medium transition-all disabled:cursor-wait disabled:opacity-60 ${
          optimisticFollowing
            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
            : "bg-h_red hover:bg-h_redDark text-white"
        }`}
      >
        {optimisticFollowing ? (
          <UserCheck className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {optimisticFollowing ? "Following" : "Follow"}
      </button>
    </form>
  );
};

export default UserInfoCardInteraction;
