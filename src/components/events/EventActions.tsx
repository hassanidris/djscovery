"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Globe, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishEvent, unpublishEvent, deleteEvent } from "@/lib/actions/event";

type Props = {
  eventId: number;
  eventSlug?: string;
  status: string;
};

export function EventActions({ eventId, eventSlug, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishEvent(eventId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Event published.");
        router.refresh();
      }
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      const result = await unpublishEvent(eventId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Event moved back to draft.");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteEvent(eventId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Event deleted.");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}

      <Button
        asChild
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-zinc-400 hover:text-white"
        disabled={isPending}
      >
        <Link href={eventSlug ? `/events/${eventSlug}/edit` : `/dj/events`}>
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edit</span>
        </Link>
      </Button>

      {status === "DRAFT" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePublish}
          disabled={isPending}
          className="h-8 px-2 text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300"
          title="Publish"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="sr-only">Publish</span>
        </Button>
      )}

      {status === "PUBLISHED" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUnpublish}
          disabled={isPending}
          className="h-8 px-2 text-amber-400 hover:bg-amber-950 hover:text-amber-300"
          title="Unpublish"
        >
          <EyeOff className="h-3.5 w-3.5" />
          <span className="sr-only">Unpublish</span>
        </Button>
      )}

      {status !== "COMPLETED" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={isPending}
          className="h-8 px-2 text-zinc-400 hover:bg-red-950 hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      )}
    </div>
  );
}
