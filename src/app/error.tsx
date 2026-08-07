"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Root error]", error);
  }, [error]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-h_red/5 absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <div className="bg-h_red/10 border-h_red/20 mb-6 flex size-14 items-center justify-center rounded-xl border">
          <AlertTriangle className="text-h_redLight h-6 w-6" />
        </div>

        <h1 className="font-heading mb-3 text-2xl text-white sm:text-3xl">
          Something went wrong
        </h1>

        <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-400">
          An unexpected error occurred. You can try again or head back to the
          home page.
        </p>

        <div className="flex items-center gap-3">
          <Button
            onClick={reset}
            className="bg-h_red hover:bg-h_redDark h-auto px-6 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
