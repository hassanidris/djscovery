import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrganizerAccountForm from "@/components/organizer/OrganizerAccountForm";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function OrganizerAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-sm text-gray-400">
          Manage your login credentials and linked accounts.
        </p>
      </div>
      <OrganizerAccountForm
        email={user.email ?? ""}
        identities={
          user.identities?.map((i) => ({
            provider: i.provider,
            identity_id: i.identity_id,
          })) ?? []
        }
      />
    </div>
  );
}
