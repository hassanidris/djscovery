"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  changeFoundingApplicationStatus,
  saveFoundingApplicationNotes,
} from "@/lib/actions/admin/founding-applications";
import type { FoundingApplicationStatus } from "@prisma/client";

const ACTIVE_STATUSES: FoundingApplicationStatus[] = [
  "PENDING",
  "EMAIL_VERIFIED",
  "UNDER_REVIEW",
];

export default function FoundingApplicationControls({
  applicationId,
  status,
  initialNotes,
}: {
  applicationId: number;
  status: FoundingApplicationStatus;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [decisionNote, setDecisionNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const isActionable = ACTIVE_STATUSES.includes(status);

  function saveNotes() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("applicationId", String(applicationId));
      formData.set("notes", notes);
      const result = await saveFoundingApplicationNotes(formData);
      if ("error" in result) toast.error(result.error);
      else toast.success("Admin notes saved");
    });
  }

  function changeStatus(nextStatus: "UNDER_REVIEW" | "APPROVED" | "REJECTED") {
    if (nextStatus === "REJECTED" && rejectionReason.trim().length < 3) {
      toast.error("Enter a rejection reason of at least 3 characters");
      return;
    }

    const actionLabel =
      nextStatus === "UNDER_REVIEW" ? "start review" : nextStatus.toLowerCase();
    if (
      nextStatus !== "UNDER_REVIEW" &&
      !window.confirm(`Confirm you want to ${actionLabel} this application?`)
    )
      return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("applicationId", String(applicationId));
      formData.set("status", nextStatus);
      formData.set("note", decisionNote);
      formData.set("reason", rejectionReason);
      const result = await changeFoundingApplicationStatus(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.warning) toast.warning(result.warning);
      else
        toast.success(
          nextStatus === "UNDER_REVIEW"
            ? "Review started"
            : `Application ${nextStatus.toLowerCase()}`,
        );
      window.location.reload();
    });
  }

  return (
    <section className="space-y-5 rounded-xl border border-white/10 bg-white/3 p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Admin review</h2>
        <p className="mt-1 text-sm text-gray-400">
          Applications may be reviewed before email ownership is verified.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="founding-admin-notes"
          className="text-sm font-medium text-gray-200"
        >
          Admin notes
        </label>
        <textarea
          id="founding-admin-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={5000}
          rows={5}
          placeholder="Record internal vetting notes..."
          className="focus:border-h_red/60 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={saveNotes}
          >
            Save notes
          </Button>
        </div>
      </div>

      {isActionable ? (
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="space-y-2">
            <label
              htmlFor="founding-decision-note"
              className="text-sm font-medium text-gray-200"
            >
              Decision / audit note
            </label>
            <textarea
              id="founding-decision-note"
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              maxLength={2000}
              rows={2}
              placeholder="Optional note added to the status history..."
              className="focus:border-h_red/60 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            />
          </div>
          {status !== "UNDER_REVIEW" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => changeStatus("UNDER_REVIEW")}
            >
              {isPending ? "Saving…" : "Start review"}
            </Button>
          )}
          <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <label
              htmlFor="founding-rejection-reason"
              className="text-sm font-medium text-gray-200"
            >
              Rejection reason
            </label>
            <textarea
              id="founding-rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Required when rejecting; included in the applicant email."
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => changeStatus("REJECTED")}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              {isPending ? "Saving…" : "Reject application"}
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => changeStatus("APPROVED")}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isPending ? "Saving…" : "Approve & send invitation"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="border-t border-white/10 pt-4 text-sm text-gray-400">
          This application is {status.toLowerCase()}; review actions are closed.
        </p>
      )}
    </section>
  );
}
