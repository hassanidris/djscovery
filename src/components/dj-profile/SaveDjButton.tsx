"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleSaveDj } from "@/lib/actions/saves";

export default function SaveDjButton({
  djProfileId,
  isSaved: initialIsSaved,
  compact = false,
}: {
  djProfileId: number;
  isSaved: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const [optimisticSaved, toggleOptimistic] = useOptimistic(
    saved,
    (state) => !state,
  );

  const handleClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    startTransition(async () => {
      toggleOptimistic(null);
      try {
        const result = await toggleSaveDj(djProfileId);
        if (result.error === "Not authenticated.") {
          toggleOptimistic(null);
          router.push("/sign-in");
          return;
        }
        if (!result.error) {
          setSaved(result.saved);
        } else {
          toggleOptimistic(null);
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
        aria-label={optimisticSaved ? "Unsave DJ" : "Save DJ"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40",
          optimisticSaved
            ? "text-white"
            : "text-gray-500 hover:text-white",
        )}
      >
        <Bookmark
          className={cn("h-4 w-4", optimisticSaved && "fill-current")}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        optimisticSaved
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/20 text-gray-300 hover:bg-white/5",
      )}
    >
      <Bookmark
        className={cn("h-3.5 w-3.5", optimisticSaved && "fill-current")}
      />
      {optimisticSaved ? "Saved" : "Save"}
    </button>
  );
}
