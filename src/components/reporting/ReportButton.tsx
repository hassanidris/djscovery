"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportModal from "./ReportModal";
import { useUser } from "@/lib/supabase/useUser";

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
      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
}
