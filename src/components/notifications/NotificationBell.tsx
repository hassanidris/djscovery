"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  getRecentNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notifications";
import { getNotificationMeta } from "@/lib/notifications/meta";
import type { NotificationType } from "@prisma/client";

type NotificationItem = {
  id: number;
  type: NotificationType;
  read: boolean;
  data: unknown;
  createdAt: Date;
  sender: {
    username: string;
    name: string | null;
    image: string | null;
  } | null;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { notifications: n, unreadCount: c } =
          await getRecentNotifications();
        if (cancelled) return;
        setNotifications(n as NotificationItem[]);
        setUnreadCount(c);
      } catch {
        if (cancelled) return;
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  }

  function handleMarkRead(id: number) {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  }

  const badgeCount = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unreadCount > 0
            ? `Notifications — ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
        className="focus-visible:ring-h_red relative flex size-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:outline-none"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden />
        {loaded && unreadCount > 0 && (
          <span className="bg-h_red absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold text-white">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-h_redLight hover:text-h_redLightDark text-xs transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {!loaded && (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              </div>
            )}

            {loaded && notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            )}

            {loaded &&
              notifications.map((n) => {
                const meta = getNotificationMeta(n.type, n.data);
                const Icon = meta.icon;
                const itemClass = `flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                  !n.read ? "bg-white/3" : ""
                }`;
                const handleClick = () => {
                  if (!n.read) handleMarkRead(n.id);
                  setOpen(false);
                };
                const content = (
                  <>
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bgColor}`}
                    >
                      <Icon className={`h-4 w-4 ${meta.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm ${
                          n.read ? "text-gray-400" : "font-medium text-white"
                        }`}
                      >
                        {meta.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        className="bg-h_red mt-2 h-2 w-2 shrink-0 rounded-full"
                        aria-hidden
                      />
                    )}
                  </>
                );
                return meta.href ? (
                  <Link
                    key={n.id}
                    href={meta.href}
                    onClick={handleClick}
                    className={itemClass}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={handleClick}
                    className={itemClass}
                  >
                    {content}
                  </button>
                );
              })}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-4 py-2.5">
            <Link
              href="/inbox"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-gray-400 transition-colors hover:text-white"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
