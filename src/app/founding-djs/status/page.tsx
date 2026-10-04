"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkFoundingApplicationStatus } from "@/lib/actions/founding-applications";

export default function FoundingDJsStatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const result = await checkFoundingApplicationStatus(email);
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Your application is pending email verification. Check your inbox for the verification link.";
      case "EMAIL_VERIFIED":
        return "Email verified. Your application is under review.";
      case "UNDER_REVIEW":
        return "Your application is being reviewed by our team. Decisions within 2 weeks.";
      case "APPROVED":
        return "Congratulations! Your application has been approved. Check your email for next steps.";
      case "REJECTED":
        return "Your application was not approved. You can reapply after 30 days.";
      case "WITHDRAWN":
        return "Your application has been withdrawn.";
      default:
        return "Unknown status";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400";
      case "EMAIL_VERIFIED":
        return "text-blue-400";
      case "UNDER_REVIEW":
        return "text-purple-400";
      case "APPROVED":
        return "text-green-400";
      case "REJECTED":
        return "text-red-400";
      case "WITHDRAWN":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="from-h_charcoal flex min-h-screen items-center justify-center bg-linear-to-b to-black px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Check Application Status
          </h1>
          <p className="text-gray-400">
            Enter your email to check your founding DJ application status.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 p-8">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
          <Button onClick={handleCheck} disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {status && (
          <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Application Status
              </h2>
              <span
                className={`text-lg font-semibold ${getStatusColor(status.status)}`}
              >
                {status.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-gray-400">{getStatusMessage(status.status)}</p>
            <div className="rounded-xl border border-white/5 bg-white/2 p-4">
              <p className="text-sm text-gray-400">
                Submitted: {new Date(status.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
