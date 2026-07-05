"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleSaveEvent } from "@/lib/actions/follows";

export default function SaveEventButton({
  eventId,
  isSaved: initialIsSaved,
}: {
  eventId: number;
  isSaved: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const [optimisticSaved, toggleOptimistic] = useOptimistic(
    saved,
    (state) => !state,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      toggleOptimistic(null);
      try {
        const result = await toggleSaveEvent(eventId);
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

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimisticSaved ? "Unsave event" : "Save event"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40",
        optimisticSaved ? "text-white" : "text-gray-400 hover:text-white",
      )}
    >
      <Bookmark className={cn("h-4 w-4", optimisticSaved && "fill-current")} />
    </button>
  );
}
