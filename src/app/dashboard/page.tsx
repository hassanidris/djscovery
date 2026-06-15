import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";

export default async function DashboardRootPage() {
  const nav = await getNavUser();

  if (nav.navRole === "organizer") redirect("/dashboard/organizer/gigs");
  if (nav.navRole === "dj") redirect("/dashboard/dj/gigs");
  if (nav.navRole === "admin") redirect("/dashboard/dj/gigs");

  redirect("/");
}
