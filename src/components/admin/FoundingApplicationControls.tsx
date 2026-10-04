"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  changeFoundingApplicationStatus,
  regenerateFoundingApplicationInvitation,
  saveFoundingApplicationNotes,
} from "@/lib/actions/admin/founding-applications";
import type { FoundingApplicationStatus } from "@prisma/client";

const ACTIVE_STATUSES: FoundingApplicationStatus[] = [
  "PENDING",
  "EMAIL_VERIFIED",
  "UNDER_REVIEW",
];

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT;")
  );
}

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
      try {
        const result = await saveFoundingApplicationNotes(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Admin notes saved");
      } catch (error) {
        if (isNextRedirect(error)) throw error;
        toast.error("Failed to save admin notes. Please try again.");
      }
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
      try {
        const result = await changeFoundingApplicationStatus(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        if (result.data.warning) toast.warning(result.data.warning);
        else
          toast.success(
            nextStatus === "UNDER_REVIEW"
              ? "Review started"
              : `Application ${nextStatus.toLowerCase()}`,
          );
        window.location.reload();
      } catch (error) {
        if (isNextRedirect(error)) throw error;
        toast.error("Failed to update application status. Please try again.");
      }
    });
  }

  function regenerateInvitation() {
    if (
      !window.confirm(
        "Revoke the current pending invitation and send a new one?",
      )
    )
      return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("applicationId", String(applicationId));
      try {
        const result = await regenerateFoundingApplicationInvitation(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        if (result.data.warning) toast.warning(result.data.warning);
        else toast.success("A new invitation was sent");
        window.location.reload();
      } catch (error) {
        if (isNextRedirect(error)) throw error;
        toast.error("Failed to regenerate invitation. Please try again.");
      }
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
      ) : status === "APPROVED" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-sm text-gray-400">
            Application approved. You can revoke the pending invitation and send
            a replacement.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={regenerateInvitation}
          >
            {isPending ? "Sending…" : "Regenerate invitation"}
          </Button>
        </div>
      ) : (
        <p className="border-t border-white/10 pt-4 text-sm text-gray-400">
          This application is {status.toLowerCase()}; review actions are closed.
        </p>
      )}
    </section>
  );
}
