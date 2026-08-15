"use client";

import Link from "next/link";
import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { getNotificationMeta } from "@/lib/notifications/meta";
import { markNotificationRead } from "@/lib/actions/notifications";
import { ReviewNotificationActions } from "./ReviewNotificationActions";
import type { NotificationType } from "@prisma/client";

type Props = {
  id: number;
  type: NotificationType;
  read: boolean;
  data: unknown;
  createdAt: Date;
};

export default function NotificationItem({
  id,
  type,
  read,
  data,
  createdAt,
}: Props) {
  const [, startTransition] = useTransition();
  const meta = getNotificationMeta(type, data);
  const Icon = meta.icon;

  function handleClick() {
    if (!read) {
      startTransition(async () => {
        await markNotificationRead(id);
      });
    }
  }

  const isReviewNotification =
    type === "EVENT_COMPLETED" || type === "GIG_COMPLETED";

  const d = (data ?? {}) as Record<string, unknown>;
  const reviewTargetType = type === "EVENT_COMPLETED" ? "EVENT" : "GIG";
  const reviewTargetId =
    typeof d.eventId === "number"
      ? d.eventId
      : typeof d.gigId === "number"
        ? d.gigId
        : 0;

  const content = (
    <>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          meta.bgColor,
        )}
      >
        <Icon className={cn("h-5 w-5", meta.iconColor)} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm",
            read ? "text-zinc-400" : "font-medium text-white",
          )}
        >
          {meta.title}
        </p>
        <p className="mt-0.5 text-sm text-zinc-400">{meta.body}</p>

        <div className="mt-2 flex items-center gap-3">
          {meta.href && meta.cta && (
            <span className="text-h_redLight text-sm font-medium">
              {meta.cta} →
            </span>
          )}
          <span className="text-xs text-zinc-600">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>

        {isReviewNotification && reviewTargetId > 0 && (
          <div className="mt-3">
            <ReviewNotificationActions
              targetType={reviewTargetType}
              targetId={reviewTargetId}
            />
          </div>
        )}
      </div>

      {!read && (
        <span
          className="bg-h_red mt-2 h-2 w-2 shrink-0 rounded-full"
          aria-hidden
        />
      )}
    </>
  );

  const rowClass =
    "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/5";

  if (meta.href) {
    return (
      <Link
        href={meta.href}
        onClick={handleClick}
        className={cn(rowClass, !read && "bg-white/3")}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("w-full text-left", rowClass, !read && "bg-white/3")}
    >
      {content}
    </button>
  );
}
