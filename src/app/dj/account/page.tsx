import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import DjAccountForm from "@/components/dj/DjAccountForm";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function DjAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [preferences] = await Promise.all([
    prisma.emailPreference.findUnique({
      where: { userId: user.id },
      select: {
        bookingEmails: true,
        gigEmails: true,
        applicationEmails: true,
        platformUpdates: true,
        marketingEmails: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-sm text-gray-400">
          Manage your login credentials, linked accounts, and preferences.
        </p>
      </div>
      <DjAccountForm
        email={user.email ?? ""}
        identities={
          user.identities?.map((i) => ({
            provider: i.provider,
            identity_id: i.identity_id,
          })) ?? []
        }
        preferences={preferences}
      />
    </div>
  );
}
