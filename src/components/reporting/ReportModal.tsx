"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

    try {
      const result = await submitReport(formData);

      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setReason("");
          setDescription("");
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {success ? (
        <DialogContent className="max-w-md border-white/10 bg-black text-white">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <AlertTriangle className="h-6 w-6 text-emerald-400" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Report Submitted</DialogTitle>
              <DialogDescription className="text-gray-400">
                Thank you for helping keep DJcovery safe. Our team will review
                your report.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="max-w-lg border-white/10 bg-black text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Report Content</DialogTitle>
          </DialogHeader>
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
                className="focus:border-h_red/50 min-h-24 resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-400"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
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
        </DialogContent>
      )}
    </Dialog>
  );
}
