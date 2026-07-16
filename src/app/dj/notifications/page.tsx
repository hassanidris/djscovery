import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import DjEmailPreferencesForm from "@/components/dj/DjEmailPreferencesForm";

export const metadata = { title: "Notification Preferences" };

export default async function DjNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const preferences = await prisma.emailPreference.findUnique({
    where: { userId: user.id },
    select: {
      bookingEmails: true,
      applicationEmails: true,
      profileReviewEmails: true,
      platformUpdates: true,
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

      <DjEmailPreferencesForm
        bookingEmails={preferences?.bookingEmails ?? true}
        applicationEmails={preferences?.applicationEmails ?? true}
        profileReviewEmails={preferences?.profileReviewEmails ?? true}
        platformUpdates={preferences?.platformUpdates ?? true}
      />
    </div>
  );
}
