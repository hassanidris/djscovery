"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitReport } from "@/lib/actions/admin/reports";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "DJ_PROFILE" | "ORGANIZER_PROFILE" | "GIG" | "REVIEW" | "MEDIA";
  targetId: string;
}

const REASONS = [
  { value: "FAKE_PROFILE", label: "Fake Profile" },
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content" },
  { value: "SCAM", label: "Scam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "WRONG_INFORMATION", label: "Wrong Information" },
  { value: "OTHER", label: "Other" },
] as const;

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"] | "">(
    "",
  );
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");

    const result = await submitReport(formData);

    if ("error" in result) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason("");
        setDescription("");
        setIsSubmitting(false);
      }, 2000);
    }
  }

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-black p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <AlertTriangle className="h-6 w-6 text-emerald-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">
            Report Submitted
          </h2>
          <p className="text-gray-400">
            Thank you for helping keep DJcovery safe. Our team will review your
            report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/10 bg-black p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Report Content</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />

          <div>
            <Label className="mb-1.5 block text-xs text-gray-300">
              Reason *
            </Label>
            <Select
              name="reason"
              value={reason}
              onValueChange={(value) => setReason(value as any)}
              required
            >
              <SelectTrigger className="focus:border-h_red/50 focus:ring-h_red/50 w-full border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-black text-white">
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-gray-300">
              Description (optional, max 1000 characters)
            </Label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide additional details..."
              maxLength={1000}
              className="focus:border-h_red/50 min-h-24 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-600"
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {description.length}/1000
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
