"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addAdminNoteAction } from "@/lib/actions/admin/booking-inquiries";

export default function AdminNoteForm({ inquiryId }: { inquiryId: number }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addAdminNoteAction(formData);
        toast.success("Admin note added");
        formRef.current?.reset();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add admin note",
        );
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="inquiryId" value={inquiryId} />
      <Textarea
        name="note"
        placeholder="Add an admin-only note to this inquiry..."
        className="min-h-20 border-white/10 bg-white/5 text-white placeholder:text-gray-500"
        required
      />
      <div className="mt-2">
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isPending}
          className="border-white/10 text-white hover:bg-white/10"
        >
          {isPending ? "Adding..." : "Add Note"}
        </Button>
      </div>
    </form>
  );
}
