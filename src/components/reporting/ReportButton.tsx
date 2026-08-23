"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/supabase/useUser";

// Lazy-load the report modal so its JS only ships when a user opens it.
// ReportButton is used across many pages (profiles, gigs, reviews, media),
// so a static import would bundle the modal everywhere.
const ReportModal = dynamic(() => import("./ReportModal"), {
  ssr: false,
  loading: () => null,
});

interface ReportButtonProps {
  targetType: "DJ_PROFILE" | "ORGANIZER_PROFILE" | "GIG" | "REVIEW" | "MEDIA";
  targetId: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "sm" | "default";
}

export function ReportButton({
  targetType,
  targetId,
  className,
  variant = "ghost",
  size = "icon",
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoaded } = useUser();

  // Only signed-in users can report content. Hide the button entirely for
  // guests (rather than showing it and failing on submit) — this applies
  // everywhere ReportButton is used across the platform.
  if (!isLoaded || !user) return null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        aria-label="Report"
        onClick={() => setIsOpen(true)}
      >
        <Flag className="h-4 w-4" />
      </Button>
      {isOpen && (
        <ReportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          targetType={targetType}
          targetId={targetId}
        />
      )}
    </>
  );
}
