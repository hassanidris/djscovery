"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[OrganizerHub error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="bg-h_red/10 border-h_red/20 flex size-12 items-center justify-center rounded-xl border">
        <AlertTriangle className="text-h_red h-5 w-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-white">
          Something went wrong
        </p>
        <p className="max-w-xs text-sm text-gray-500">
          An error occurred while loading this page. Please try again.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
