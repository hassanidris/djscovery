import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";

export default async function DashboardRootPage() {
  const nav = await getNavUser();

  if (nav.navRole === "organizer") redirect("/organizer/gigs");
  if (nav.navRole === "dj") redirect("/dj/overview");
  if (nav.navRole === "admin") redirect("/dj/overview");

  redirect("/");
}
