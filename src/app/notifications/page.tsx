import { getAllNotifications, markNotificationRead } from "@/lib/actions/notifications";
import { formatNotification } from "@/lib/notifications/format";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { redirect } from "next/navigation";
import NotificationsMarkAll from "./NotificationsMarkAll";

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
            <p className="mt-1 text-sm text-gray-400">
              {unreadCount} unread
            </p>
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
        <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          {notifications.map((n) => {
            const { icon, message } = formatNotification(n.type);
            return (
              <form
                key={n.id}
                action={markNotificationRead.bind(null, n.id)}
                className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/5 ${
                  !n.read ? "bg-white/[0.03]" : ""
                }`}
              >
                <span className="mt-0.5 shrink-0 text-xl">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      n.read ? "text-gray-400" : "font-medium text-white"
                    }`}
                  >
                    {message}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!n.read && (
                  <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    <span
                      className="bg-h_red h-2 w-2 rounded-full"
                      aria-hidden
                    />
                    <button
                      type="submit"
                      className="text-h_red hover:text-h_redDark text-xs transition-colors"
                    >
                      Mark read
                    </button>
                  </div>
                )}
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
