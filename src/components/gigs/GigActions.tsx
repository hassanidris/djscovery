"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publishGig, closeGig, cancelGig } from "@/lib/actions/gigs";
import type { GigStatus } from "@prisma/client";

export function GigActions({
  gigId,
  status,
}: {
  gigId: number;
  status: GigStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAction(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMsg: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  const canPublish = status === "DRAFT" || status === "UNDER_REVIEW";
  const canClose = status === "PUBLISHED" || status === "UNDER_REVIEW";
  const canCancel = status !== "CANCELLED" && status !== "EXPIRED";

  if (!canPublish && !canClose && !canCancel) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {canPublish && (
        <button
          disabled={isPending}
          onClick={() =>
            handleAction(
              () => publishGig(gigId),
              "Gig published successfully.",
            )
          }
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:opacity-50"
        >
          {isPending ? "Publishing…" : "Publish Gig"}
        </button>
      )}

      {canClose && (
        <button
          disabled={isPending}
          onClick={() =>
            handleAction(() => closeGig(gigId), "Gig marked as filled.")
          }
          className="rounded-lg border border-blue-500/40 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/10 disabled:opacity-50"
        >
          {isPending ? "Closing…" : "Mark as Filled"}
        </button>
      )}

      {canCancel && (
        <button
          disabled={isPending}
          onClick={() => {
            if (
              !confirm(
                "Cancel this gig? All pending applications will be rejected.",
              )
            )
              return;
            handleAction(() => cancelGig(gigId), "Gig cancelled.");
          }}
          className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          {isPending ? "Cancelling…" : "Cancel Gig"}
        </button>
      )}
    </div>
  );
}
