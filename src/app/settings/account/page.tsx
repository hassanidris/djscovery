import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSettingsForm from "@/components/settings/AccountSettingsForm";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <AccountSettingsForm currentEmail={user.email ?? ""} />
  );
}
