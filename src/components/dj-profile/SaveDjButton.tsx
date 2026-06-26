"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFollowDj } from "@/lib/actions/saves";
import { toast } from "sonner";

export default function SaveDjButton({
  djProfileId,
  isFollowed: initialIsFollowing,
  compact = false,
}: {
  djProfileId: number;
  isFollowed: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const [optimisticFollowing, toggleOptimistic] = useOptimistic(
    following,
    (state) => !state,
  );

  const handleClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    startTransition(async () => {
      toggleOptimistic(null);
      try {
        const result = await toggleFollowDj(djProfileId);
        if (result.error === "Not authenticated.") {
          toggleOptimistic(null);
          router.push("/sign-in");
          return;
        }
        if (!result.error) {
          setFollowing(result.following);
        } else {
          toggleOptimistic(null);
          toast.error(result.error);
        }
      } catch {
        toggleOptimistic(null);
      }
    });
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={optimisticFollowing ? "Unfollow DJ" : "Follow DJ"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40",
          optimisticFollowing ? "text-white" : "text-gray-500 hover:text-white",
        )}
      >
        {optimisticFollowing ? (
          <UserMinus className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        optimisticFollowing
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/20 text-gray-300 hover:bg-white/5",
      )}
    >
      {optimisticFollowing ? (
        <UserMinus className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {optimisticFollowing ? "Following" : "Follow"}
    </button>
  );
}
