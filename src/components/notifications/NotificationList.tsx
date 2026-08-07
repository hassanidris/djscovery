"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import type { NotificationType } from "@prisma/client";
import { cn } from "@/lib/utils";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import NotificationItem from "./NotificationItem";

type Notification = {
  id: number;
  type: NotificationType;
  read: boolean;
  data: unknown;
  createdAt: Date;
};

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-zinc-400" />
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-h_red flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-h_redLight hover:text-h_redLightDark flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            {isPending ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
        />
        <FilterButton
          active={filter === "unread"}
          onClick={() => setFilter("unread")}
          label={`Unread ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
        />
      </div>

      {/* List */}
      <div className="max-h-125 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <Bell className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((n) => (
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
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-h_red border-b-2 text-white"
          : "text-zinc-400 hover:text-zinc-300",
      )}
    >
      {label}
    </button>
  );
}
