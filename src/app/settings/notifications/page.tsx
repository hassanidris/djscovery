import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import EmailPreferencesForm from "./EmailPreferencesForm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const prefs = await prisma.emailPreference.findUnique({
    where: { userId: user.id },
  });

  const { saved } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Email Notifications
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Choose which emails you&apos;d like to receive. Verification,
          security, and password reset emails cannot be disabled.
        </p>
      </div>

      {saved === "1" && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
          Preferences saved.
        </div>
      )}

      <EmailPreferencesForm
        bookingEmails={prefs?.bookingEmails ?? true}
        gigEmails={prefs?.gigEmails ?? true}
        applicationEmails={prefs?.applicationEmails ?? true}
        platformUpdates={prefs?.platformUpdates ?? true}
        marketingEmails={prefs?.marketingEmails ?? false}
      />
    </div>
  );
}
