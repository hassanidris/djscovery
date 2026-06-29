import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";

export default async function AccountSavedDjsPage() {
  const { navRole } = await getNavUser();
  if (navRole === "fan") redirect("/fan/followed-djs");
  redirect("/account/followed-djs");
}
