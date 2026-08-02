"use client";

import { useState } from "react";
import { toast } from "sonner";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { updateHireNotes } from "@/lib/actions/admin/hires";

type Props = {
  hireId: number;
  initialNotes: string;
};

export default function NotesForm({ hireId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <label htmlFor="hire-notes" className="sr-only">
        Admin Notes
      </label>
      <textarea
        id="hire-notes"
        name="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add admin notes about this hire..."
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none"
        rows={4}
      />
      <div className="mt-3 flex justify-end">
        <AdminActionButton
          label="Save Notes"
          description="Update the admin notes for this hire?"
          confirmLabel="Save"
          fields={{ hireId: String(hireId), notes }}
          action={updateHireNotes}
          successMessage="Notes updated"
          requireConfirm={false}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          Save Notes
        </AdminActionButton>
      </div>
    </div>
  );
}
