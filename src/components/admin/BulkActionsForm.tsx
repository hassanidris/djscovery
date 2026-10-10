"use client";

import { useTransition } from "react";
import { toast } from "sonner";

interface BulkActionsFormProps {
  id?: string;
  action: (
    formData: FormData,
  ) => Promise<{ success: true; data?: any } | { error: string }>;
}

export function BulkActionsForm({ id, action }: BulkActionsFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Bulk action completed successfully");
        if (result.data?.processed) {
          toast.success(`Processed ${result.data.processed} applications`);
        }
        if (result.data?.warning) {
          toast.warning(result.data.warning);
        }
        // Refresh the page
        window.location.reload();
      }
    });
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-3"
    >
      <select
        name="status"
        className="h-10 rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white"
        disabled={isPending}
      >
        <option value="">Bulk action...</option>
        <option value="UNDER_REVIEW">Mark as Under Review</option>
        <option value="APPROVED">Approve Selected</option>
        <option value="REJECTED">Reject Selected</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-md bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
      >
        {isPending ? "Processing..." : "Apply"}
      </button>
      <span className="text-xs text-gray-500">
        Select applications below to apply bulk actions
      </span>
    </form>
  );
}
