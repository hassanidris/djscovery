"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FoundingDJsSuccessPage() {
  const [shared, setShared] = useState(false);

  const handleShare = async (platform: string) => {
    const text =
      "I just applied to become a founding DJ on Djscovery! Join the first wave of talent shaping the future of DJ discovery.";
    const url = "https://djscovery.com/founding-djs";

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      setShared(true);
    }
  };

  return (
    <div className="from-h_charcoal flex min-h-screen items-center justify-center bg-linear-to-b to-black px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
            <svg
              className="h-10 w-10 text-white"
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
          <h1 className="text-3xl font-bold text-white">
            Application Submitted!
          </h1>
          <p className="text-gray-400">
            Thank you for applying to become a founding DJ. We&apos;ve received
            your application and are excited to review it.
          </p>
          <div className="rounded-xl border border-white/5 bg-white/2 p-4">
            <p className="text-sm text-gray-400">
              We aim to review all applications within 2 weeks. You&apos;ll
              receive an email verification link shortly to confirm your
              identity.
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 p-8">
          <h2 className="text-xl font-semibold text-white">
            Share with Friends
          </h2>
          <p className="text-gray-400">
            Know other DJs who might be interested? Share the founding program
            with them.
          </p>
          <div className="mb-6 flex justify-center gap-4">
            <button
              onClick={() => handleShare("twitter")}
              className="bg-h_red hover:bg-h_redDark rounded-lg px-6 py-3 font-semibold text-white transition-colors"
            >
              Share on Twitter
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="bg-h_red hover:bg-h_redDark rounded-lg px-6 py-3 font-semibold text-white transition-colors"
            >
              Share on LinkedIn
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="bg-h_red hover:bg-h_redDark rounded-lg px-6 py-3 font-semibold text-white transition-colors"
            >
              Share on Facebook
            </button>
          </div>
          {shared && (
            <p className="text-sm text-green-400">
              Thanks for sharing! The founding program is growing.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/founding-djs/status"
            className="bg-h_red hover:bg-h_redDark inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors"
          >
            Check Status
          </Link>
          <Link
            href="/founding-djs"
            className="inline-block rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
