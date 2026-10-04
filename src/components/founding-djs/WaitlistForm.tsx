"use client";

import { useState } from "react";
import { addToWaitlist } from "@/lib/actions/founding-applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WaitlistForm() {
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistLoading(true);
    setWaitlistError(null);

    try {
      const result = await addToWaitlist({
        name: waitlistName,
        email: waitlistEmail,
        isDj: false,
      });

      if (result.success) {
        setWaitlistSuccess(true);
        setWaitlistName("");
        setWaitlistEmail("");
      } else {
        setWaitlistError(result.error);
      }
    } catch (err) {
      setWaitlistError("An unexpected error occurred. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  if (waitlistSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="bg-h_red/10 border-h_red/20 flex size-12 items-center justify-center rounded-full border">
          <svg
            className="text-h_redLight h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-400">
          You're on the waitlist! We'll notify you when we launch.
        </p>
      </div>
    );
  }

  return (
    <>
      {waitlistError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-300">{waitlistError}</p>
        </div>
      )}
      <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-3">
        <Input
          type="text"
          value={waitlistName}
          onChange={(e) => setWaitlistName(e.target.value)}
          placeholder="Your name"
          className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
        />
        <Input
          type="email"
          value={waitlistEmail}
          onChange={(e) => setWaitlistEmail(e.target.value)}
          placeholder="Your email"
          required
          className="focus-visible:border-h_red/50 focus-visible:ring-h_red/20 h-10 border-white/10 bg-white/5 text-white placeholder:text-white/30"
        />
        <Button
          type="submit"
          disabled={waitlistLoading}
          className="bg-h_red hover:bg-h_redDark w-full"
        >
          {waitlistLoading ? "Joining..." : "Join the Waitlist"}
        </Button>
      </form>
    </>
  );
}
