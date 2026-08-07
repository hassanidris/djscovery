"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  respondToBookingInquiry,
  sendBookingInquiryMessage,
} from "@/lib/actions/booking-inquiry";
import { cn } from "@/lib/utils";

export type BookingInquiryStatus =
  "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
export type BookingMessage = {
  id: number;
  body: string;
  senderRole: "DJ" | "ORGANIZER";
  senderName: string;
  createdAt: string;
};

export type BookingInquiryViewModel = {
  id: number;
  status: BookingInquiryStatus;
  eventName: string;
  eventDate?: string | null;
  venue?: string | null;
  city?: string | null;
  createdAt: string;
  lastRespondedAt?: string | null;
  counterpartyName: string;
  counterpartyEmail?: string | null;
  contactVisible: boolean;
  messages: BookingMessage[];
  packageName?: string | null;
  packagePrice?: number | null;
  packagePriceTo?: number | null;
};

export type BookingInquiryCardProps = {
  viewerRole: "DJ" | "ORGANIZER";
  inquiry: BookingInquiryViewModel;
};

const STATUS_THEME: Record<
  BookingInquiryStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-amber-500/15 text-amber-300" },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-500/15 text-emerald-300",
  },
  DECLINED: { label: "Declined", className: "bg-red-500/15 text-red-300" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/15 text-red-300" },
};

export function BookingInquiryCard({
  viewerRole,
  inquiry,
}: BookingInquiryCardProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isResponding, startRespondTransition] = useTransition();
  const [isMessaging, startMessageTransition] = useTransition();

  const statusTheme = STATUS_THEME[inquiry.status];
  const sortedMessages = useMemo(
    () =>
      [...inquiry.messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [inquiry.messages],
  );

  const formattedEventMeta = useMemo(() => {
    const parts: string[] = [];
    if (inquiry.eventDate) {
      parts.push(new Date(inquiry.eventDate).toLocaleDateString());
    }
    if (inquiry.venue) {
      parts.push(inquiry.venue);
    }
    if (inquiry.city) {
      parts.push(inquiry.city);
    }
    return parts.join(" · ");
  }, [inquiry.eventDate, inquiry.venue, inquiry.city]);

  const canRespond = viewerRole === "DJ" && inquiry.status === "PENDING";
  const canMessage =
    inquiry.status !== "DECLINED" && inquiry.status !== "CANCELLED";

  const handleDecision = (decision: "ACCEPT" | "DECLINE") => {
    startRespondTransition(async () => {
      try {
        const result = await respondToBookingInquiry({
          inquiryId: inquiry.id,
          decision,
          note: note.trim() ? note.trim() : undefined,
        });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success(
          decision === "ACCEPT"
            ? "Booking request accepted"
            : "Booking request declined",
        );
        setNote("");
        router.refresh();
      } catch (error) {
        console.error("Failed to respond to booking inquiry", error);
        toast.error("Something went wrong. Please refresh and try again.");
        router.refresh();
      }
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    startMessageTransition(async () => {
      try {
        const result = await sendBookingInquiryMessage({
          inquiryId: inquiry.id,
          message: message.trim(),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Message sent");
        setMessage("");
        router.refresh();
      } catch (error) {
        console.error("Failed to send booking inquiry message", error);
        toast.error("Something went wrong. Please refresh and try again.");
        router.refresh();
      }
    });
  };

  const footerNote = useMemo(() => {
    if (inquiry.lastRespondedAt) {
      return `Updated ${new Date(inquiry.lastRespondedAt).toLocaleString()}`;
    }
    return `Created ${new Date(inquiry.createdAt).toLocaleString()}`;
  }, [inquiry.createdAt, inquiry.lastRespondedAt]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              {inquiry.eventName}
            </h3>
            <Badge className={cn("text-xs font-normal", statusTheme.className)}>
              {statusTheme.label}
            </Badge>
          </div>
          {inquiry.packageName && (
            <div className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2">
              <p className="text-xs font-medium text-amber-400">
                Package: {inquiry.packageName}
              </p>
              {inquiry.packagePrice && (
                <p className="mt-1 text-xs text-gray-400">
                  {inquiry.packagePrice.toLocaleString()}
                  {inquiry.packagePriceTo &&
                    ` – ${inquiry.packagePriceTo.toLocaleString()}`}
                </p>
              )}
            </div>
          )}
          {formattedEventMeta && (
            <p className="text-sm text-gray-400">{formattedEventMeta}</p>
          )}
          <p className="text-xs text-gray-400">
            With {inquiry.counterpartyName}
          </p>
        </div>
        <p className="text-xs text-gray-400">{footerNote}</p>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Conversation</h4>
          <div className="mt-3 flex flex-col gap-3">
            {sortedMessages.length === 0 ? (
              <p className="text-sm text-gray-400">
                No messages yet. Send the first message to confirm details.
              </p>
            ) : (
              sortedMessages.map((msg) => {
                const isViewer =
                  (viewerRole === "DJ" && msg.senderRole === "DJ") ||
                  (viewerRole === "ORGANIZER" &&
                    msg.senderRole === "ORGANIZER");
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1",
                      isViewer ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-full rounded-xl border px-3 py-2 text-sm leading-relaxed",
                        isViewer
                          ? "border-h_red/40 bg-h_red/20 text-white"
                          : "border-white/10 bg-white/10 text-gray-100",
                      )}
                    >
                      <p className="wrap-break-word whitespace-pre-wrap">
                        {msg.body}
                      </p>
                    </div>
                    <span className="text-[11px] tracking-wide text-gray-400 uppercase">
                      {msg.senderName} ·{" "}
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {inquiry.contactVisible && inquiry.counterpartyEmail && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-semibold">Contact details unlocked</p>
            <p className="mt-1 text-emerald-200">
              Email: {inquiry.counterpartyEmail}
            </p>
          </div>
        )}

        {canRespond && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">
              Respond to request
            </p>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note to include with your response"
              className="mt-3"
            />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleDecision("DECLINE")}
                disabled={isResponding}
              >
                {isResponding ? "Processing..." : "Decline"}
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => handleDecision("ACCEPT")}
                disabled={isResponding}
              >
                {isResponding ? "Processing..." : "Accept"}
              </Button>
            </div>
          </div>
        )}

        {canMessage && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Send a message</p>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share more details, ask questions, or confirm logistics..."
              className="mt-3"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={handleSendMessage} disabled={isMessaging}>
                {isMessaging ? "Sending..." : "Send message"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
