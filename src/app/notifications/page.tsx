import { getAllNotifications } from "@/lib/actions/notifications";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationsMarkAll from "./NotificationsMarkAll";
import NotificationItem from "./NotificationItem";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const notifications = await getAllNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-400">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && <NotificationsMarkAll />}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-3 font-semibold text-white">No notifications yet</p>
          <p className="mt-1 text-sm text-gray-400">
            We&apos;ll let you know when something happens.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              type={n.type}
              read={n.read}
              data={n.data}
              createdAt={n.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
