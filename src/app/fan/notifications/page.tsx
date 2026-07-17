import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import FanEmailPreferencesForm from "@/components/fan/FanEmailPreferencesForm";

export const metadata = { title: "Notification Preferences" };

export default async function FanNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const preferences = await prisma.emailPreference.findUnique({
    where: { userId: user.id },
    select: {
      platformUpdates: true,
      marketingEmails: true,
    },
  });

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

      <FanEmailPreferencesForm
        platformUpdates={preferences?.platformUpdates ?? true}
        marketingEmails={preferences?.marketingEmails ?? false}
      />
    </div>
  );
}
