import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSettingsForm from "@/components/account/AccountSettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account Settings" };

export default async function FanAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Account Settings</h2>
        <p className="mt-1 text-sm text-gray-400">
          Manage your login email and password.
        </p>
      </div>

      <AccountSettingsForm currentEmail={user.email ?? ""} />
    </div>
  );
}
