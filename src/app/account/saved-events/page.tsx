import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";
import SavedEventsContent from "@/components/fan/SavedEventsContent";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved Events" };

export default async function SavedEventsPage() {
  const { navRole } = await getNavUser();
  if (navRole === "fan") redirect("/fan/saved-events");

  return <SavedEventsContent />;
}
