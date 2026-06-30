"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url,
        });
      } catch {
        // user cancelled — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable — no-op
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-white"
      aria-label="Share"
      onClick={handleShare}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </Button>
  );
}
