import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
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

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { roles: { select: { role: true } } },
  });
  const roles = profile?.roles.map((r) => r.role) ?? [];
  const isDjOrAdmin = roles.includes("DJ") || roles.includes("ADMIN");

  if (!isDjOrAdmin) redirect("/account/settings");

  return <AccountSettingsForm currentEmail={user.email ?? ""} />;
}
