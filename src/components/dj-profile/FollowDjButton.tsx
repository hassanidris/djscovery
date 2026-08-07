"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFollowDj } from "@/lib/actions/follows";
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
          optimisticFollowing ? "text-white" : "text-gray-400 hover:text-white",
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
      aria-pressed={optimisticFollowing}
      aria-label={optimisticFollowing ? "Unfollow DJ" : "Follow DJ"}
      className={cn(
        "group flex cursor-pointer items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium shadow-lg transition-colors disabled:opacity-60",
        "focus-visible:ring-h_red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none",
        optimisticFollowing
          ? "border-white/30 bg-white/10 text-white hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 focus-visible:border-red-500/40 focus-visible:bg-red-500/10 focus-visible:text-red-400"
          : "bg-h_red hover:bg-h_redDark border-transparent text-white",
      )}
    >
      {optimisticFollowing ? (
        <>
          {/* Default state: "Following" */}
          <span className="flex items-center gap-1.5 group-hover:hidden group-focus-visible:hidden">
            <UserCheck className="h-3.5 w-3.5" />
            Following
          </span>
          {/* Hover/focus state: "Unfollow" */}
          <span className="hidden items-center gap-1.5 group-hover:flex group-focus-visible:flex">
            <UserMinus className="h-3.5 w-3.5" />
            Unfollow
          </span>
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </>
      )}
    </button>
  );
}
