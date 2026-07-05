"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { unfollowDj } from "@/lib/actions/follows";

export default function UnfollowDjButton({
  djProfileId,
  onSuccess,
}: {
  djProfileId: number;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Unfollow DJ"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await unfollowDj(djProfileId);
          if (result && "error" in result) {
            if (result.error === "Not authenticated.") {
              router.push("/sign-in");
            } else {
              toast.error(result.error);
            }
            return;
          }
          onSuccess?.();
        })
      }
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-40"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
