import { getNavUser } from "@/lib/auth/getNavUser";
import { redirect } from "next/navigation";

export default async function DjDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, navRole } = await getNavUser();

  if (!isLoggedIn) redirect("/sign-in");
  if (navRole !== "dj" && navRole !== "admin") redirect("/become-dj");

  return <>{children}</>;
}
