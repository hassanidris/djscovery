"use client";

/*
  WHY a separate client component:
  SuggestedDJs.tsx is a server component (it fetches from the DB).
  The follow button needs useOptimistic — a React hook that only
  works in client components. Next.js App Router lets us nest a
  small client component inside a server component parent,
  keeping the server fetch in SuggestedDJs and the interactivity
  isolated here.

  useOptimistic: immediately flips the button text/style before
  the server action resolves, so the UI feels instant even on
  a slow connection.
*/

import { switchFollow } from "@/lib/actions";
import { UserCheck, UserPlus } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

const SuggestFollowBtn = ({
  userId,
  isFollowing = false,
}: {
  userId: string;
  isFollowing?: boolean;
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
      }
    });
  };

  return (
    <form action={follow}>
      <button
        disabled={isPending}
        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait ${
          optimisticFollowing
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer"
            : "bg-h_red/10 text-h_red border border-h_red/20 hover:bg-h_red/20 cursor-pointer"
        }`}
      >
        {optimisticFollowing ? (
          <UserCheck className="w-3 h-3" />
        ) : (
          <UserPlus className="w-3 h-3" />
        )}
        {optimisticFollowing ? "Following" : "Follow"}
      </button>
    </form>
  );
};

export default SuggestFollowBtn;
