import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";
import FollowedDjsContent from "@/components/fan/FollowedDjsContent";

export const dynamic = "force-dynamic";
export const metadata = { title: "Followed DJs" };

export default async function FollowedDjsPage() {
  const { navRole } = await getNavUser();
  if (navRole === "fan") redirect("/fan/followed-djs");

  return <FollowedDjsContent />;
}
