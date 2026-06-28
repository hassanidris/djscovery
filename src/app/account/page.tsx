import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";

export default async function AccountPage() {
  const { navRole } = await getNavUser();
  if (navRole === "fan") redirect("/fan/profile");
  redirect("/account/settings");
}
