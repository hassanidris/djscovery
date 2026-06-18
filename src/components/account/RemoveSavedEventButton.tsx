"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { removeSavedEvent } from "@/lib/actions/saves";

export default function RemoveSavedEventButton({
  eventId,
}: {
  eventId: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      aria-label="Remove saved event"
      disabled={isPending}
      onClick={() => startTransition(() => void removeSavedEvent(eventId))}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-40"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
