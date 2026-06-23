"use client";

import Link from "next/link";
import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatNotification } from "@/lib/notifications/format";
import { markNotificationRead } from "@/lib/actions/notifications";
import type { NotificationType } from "@prisma/client";

type Props = {
  id: number;
  type: NotificationType;
  read: boolean;
  data: unknown;
  createdAt: Date;
};

export default function NotificationItem({ id, type, read, data, createdAt }: Props) {
  const [, startTransition] = useTransition();
  const { icon, message, link } = formatNotification(type, data);

  function handleClick() {
    if (!read) {
      startTransition(async () => {
        await markNotificationRead(id);
      });
    }
  }

  const rowClass = `flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/5 ${
    !read ? "bg-white/[0.03]" : ""
  }`;

  const content = (
    <>
      <span className="mt-0.5 shrink-0 text-xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${read ? "text-gray-400" : "font-medium text-white"}`}>
          {message}
        </p>
        <p className="mt-0.5 text-xs text-gray-600">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
      {!read && (
        <span className="bg-h_red mt-1.5 h-2 w-2 shrink-0 rounded-full" aria-hidden />
      )}
    </>
  );

  if (link) {
    return (
      <Link href={link} onClick={handleClick} className={rowClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={`w-full text-left ${rowClass}`}>
      {content}
    </button>
  );
}
