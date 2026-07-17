import { getAllNotifications } from "@/lib/actions/notifications";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationList } from "@/components/notifications/NotificationList";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const notifications = await getAllNotifications();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <NotificationList notifications={notifications} />
    </div>
  );
}
