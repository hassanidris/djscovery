import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, navRole, isOrganizer } = await getNavUser();
  if (!isLoggedIn) redirect("/sign-in");

  const isDj = navRole === "dj" || navRole === "admin";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your account and profile settings.
          </p>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <SettingsSidebar isDj={isDj} isOrganizer={isOrganizer} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
