"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollowDj } from "@/lib/actions/follows";

interface Props {
  djProfileId: number;
  initialFollowing: boolean;
  size?: "sm" | "default";
}

export default function FollowButton({
  djProfileId,
  initialFollowing,
  size = "default",
}: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollowDj(djProfileId);

      if (result.error) {
        if (result.error === "Not authenticated.") {
          router.push("/sign-in");
        } else {
          toast.error(result.error);
        }
        return;
      }

      setFollowing(result.following);
      toast.success(result.following ? "Following DJ" : "Unfollowed");
    });
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      size={size}
      disabled={isPending}
      onClick={handleClick}
      className={
        following
          ? "border-white/20 text-gray-300 hover:border-red-500/40 hover:text-red-400"
          : ""
      }
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
