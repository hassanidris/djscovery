"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyFoundingApplicationEmail } from "@/lib/actions/founding-applications";
import { Button } from "@/components/ui/button";

export default function FoundingDJsVerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleVerify = async (token: string, email: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await verifyFoundingApplicationEmail(email, token);
      if (result.success) {
        setVerified(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    let isCurrent = true;

    if (token && email) {
      queueMicrotask(() => {
        if (isCurrent) {
          handleVerify(token, email);
        }
      });
    }

    return () => {
      isCurrent = false;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="from-h_charcoal flex min-h-screen items-center justify-center bg-linear-to-b to-black px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="border-h_red h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="from-h_charcoal flex min-h-screen items-center justify-center bg-linear-to-b to-black px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 px-8 py-16 text-center">
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
            <h1 className="text-3xl font-bold text-white">Email Verified!</h1>
            <p className="text-gray-400">
              Your email has been successfully verified. Your application is now
              under review.
            </p>
            <div className="rounded-xl border border-white/5 bg-white/2 p-4">
              <p className="text-sm text-gray-400">
                We&apos;ll review your application within 2 weeks. You&apos;ll
                receive an email once a decision has been made.
              </p>
            </div>
            <Button onClick={() => router.push("/founding-djs/status")}>
              Check Status
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-h_charcoal flex min-h-screen items-center justify-center bg-linear-to-b to-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/2 px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-white">
            Email Verification Failed
          </h1>
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          <p className="text-gray-400">
            The verification link is invalid or has expired. Please request a
            new verification link.
          </p>
          <Button onClick={() => router.push("/founding-djs/apply")}>
            Return to Application
          </Button>
        </div>
      </div>
    </div>
  );
}
