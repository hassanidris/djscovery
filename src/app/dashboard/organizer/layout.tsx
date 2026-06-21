import { getNavUser } from "@/lib/auth/getNavUser";
import { redirect } from "next/navigation";

export default async function OrganizerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isOrganizer, navRole } = await getNavUser();

  if (!isLoggedIn) redirect("/sign-in");
  if (!isOrganizer && navRole !== "admin") redirect("/become-organizer");

  return <>{children}</>;
}
