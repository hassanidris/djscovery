"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyToGig, withdrawApplication } from "@/lib/actions/gigs";
import type { GigApplicationStatus } from "@prisma/client";

type Props = {
  gigId: number;
  applicationId: number | null;
  applicationStatus: GigApplicationStatus | null;
};

export function GigApplicationButton({
  gigId,
  applicationId,
  applicationStatus,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  function handleApply() {
    startTransition(async () => {
      const result = await applyToGig({ gigId, message: message || undefined });
      if (result.success) {
        toast.success("Application submitted!");
        setShowForm(false);
        setMessage("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  function handleWithdraw() {
    if (!applicationId) return;
    if (!confirm("Withdraw your application?")) return;
    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
      if (result.success) {
        toast.success("Application withdrawn.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  // Terminal states — show badge only
  if (applicationStatus === "ACCEPTED") {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-center">
        <p className="font-medium text-green-400">
          🎉 You have been accepted for this gig!
        </p>
      </div>
    );
  }
  if (applicationStatus === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-center">
        <p className="text-sm text-red-400">
          Your application was not selected for this gig.
        </p>
      </div>
    );
  }
  if (applicationStatus === "WITHDRAWN" && !showForm) {
    return (
      <button
        disabled={isPending}
        onClick={() => setShowForm(true)}
        className="w-full rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
      >
        Apply Again
      </button>
    );
  }

  // Active application — show withdraw
  if (applicationStatus === "APPLIED" || applicationStatus === "SHORTLISTED") {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 text-center">
          <p className="text-sm text-amber-400">
            {applicationStatus === "SHORTLISTED"
              ? "🌟 You have been shortlisted for this gig."
              : "Your application is under review."}
          </p>
        </div>
        <button
          disabled={isPending}
          onClick={handleWithdraw}
          className="w-full rounded-xl border border-red-500/20 px-5 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/5 disabled:opacity-50"
        >
          {isPending ? "Withdrawing…" : "Withdraw Application"}
        </button>
      </div>
    );
  }

  // No application — show apply form toggle
  if (showForm) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-white/15 p-4">
        <label className="text-sm font-medium text-white">
          Cover message{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Introduce yourself and explain why you're a great fit…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-white/25 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            disabled={isPending}
            onClick={handleApply}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50"
          >
            {isPending ? "Submitting…" : "Submit Application"}
          </button>
          <button
            disabled={isPending}
            onClick={() => setShowForm(false)}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
    >
      Apply for This Gig
    </button>
  );
}
