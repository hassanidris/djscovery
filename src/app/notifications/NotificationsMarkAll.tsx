"use client";

import { useTransition } from "react";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";

export default function NotificationsMarkAll() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleMarkAll}
      disabled={isPending}
      className="text-h_red hover:text-h_redDark text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isPending ? "Marking..." : "Mark all as read"}
    </button>
  );
}
