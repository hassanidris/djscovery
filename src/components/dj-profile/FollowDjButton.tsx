"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import { switchFollow } from "@/lib/actions";

export default function FollowDjButton({
  djUserId,
  isFollowing: initialIsFollowing,
}: {
  djUserId: string;
  isFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const [optimisticFollowing, toggleOptimistic] = useOptimistic(
    following,
    (state) => !state,
  );

  const handleClick = () => {
    startTransition(async () => {
      toggleOptimistic(null);
      const result = await switchFollow(djUserId);
      if (result?.errorCode === "UNAUTHENTICATED") {
        toggleOptimistic(null);
        router.push("/sign-in");
      } else if (result?.errorCode === "UNKNOWN") {
        toggleOptimistic(null);
        toast.error("Something went wrong. Please try again.");
      } else {
        setFollowing((prev) => !prev);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
        optimisticFollowing
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/20 text-gray-300 hover:bg-white/5"
      }`}
    >
      {optimisticFollowing ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {optimisticFollowing ? "Following" : "Follow"}
    </button>
  );
}
