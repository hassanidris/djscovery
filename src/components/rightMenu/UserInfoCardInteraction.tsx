"use client";

import { switchFollow } from "@/lib/actions";
import { useOptimistic, useState } from "react";

const UserInfoCardInteraction = ({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) => {
  const [following, setFollowing] = useState(isFollowing);

  const [optimisticFollowing, toggleOptimistic] = useOptimistic(
    following,
    (state) => !state,
  );

  const follow = async () => {
    toggleOptimistic(null);
    try {
      await switchFollow(userId);
      setFollowing((prev) => !prev);
    } catch (err) {
      console.log(err);
      toggleOptimistic(null);
    }
  };

  return (
    <form action={follow}>
      <button className="w-full bg-blue-500 text-white text-sm rounded-md p-2">
        {optimisticFollowing ? "Following" : "Follow"}
      </button>
    </form>
  );
};

export default UserInfoCardInteraction;
