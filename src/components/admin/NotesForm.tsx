"use client";

import { useTransition } from "react";
import { toast } from "sonner";

interface NotesFormProps {
  memberId: string;
  action: (formData: FormData) => Promise<{ success: true } | { error: string }>;
  defaultNotes: string | null;
}

export function NotesForm({ memberId, action, defaultNotes }: NotesFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("memberId", memberId);
    
    startTransition(async () => {
      const result = await action(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Notes updated successfully");
        window.location.reload();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="memberId" value={memberId} />
      <label className="text-xs font-medium text-gray-400">
        Admin Notes
        <textarea
          name="notes"
          defaultValue={defaultNotes ?? ""}
          rows={4}
          className="mt-1.5 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-500"
          placeholder="Add notes about this member..."
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-md bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save notes"}
      </button>
    </form>
  );
}
