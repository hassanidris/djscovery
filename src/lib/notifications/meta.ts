import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Ban,
  Bookmark,
  Calendar,
  CalendarHeart,
  CheckCircle2,
  Clock,
  Flag,
  Hand,
  Headphones,
  Inbox,
  Mail,
  Megaphone,
  MessageCircle,
  PartyPopper,
  Play,
  Reply,
  ShieldAlert,
  Star,
  Target,
  Undo2,
  User,
  XCircle,
} from "lucide-react";
import { formatNotification } from "./format";

export type NotificationMeta = {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  title: string;
  body: string;
  cta: string | null;
  href: string | null;
};

type NotificationTypeLocal =
  | "BOOKING_INQUIRY"
  | "BOOKING_INQUIRY_RESPONSE"
  | "BOOKING_INQUIRY_MESSAGE"
  | string;

export function getNotificationMeta(
  type: NotificationTypeLocal,
  data?: unknown,
): NotificationMeta {
  const { message, link } = formatNotification(type, data);
  const base = getBaseMeta(type);
  return { ...base, body: message, href: link };
}

function getBaseMeta(
  type: NotificationTypeLocal,
): Omit<NotificationMeta, "body" | "href"> {
  const normalizedType = typeof type === "string" ? type : "UNKNOWN";
  const green = {
    iconColor: "text-green-400",
    bgColor: "bg-green-500/10",
  } as const;
  const blue = {
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
  } as const;
  const amber = {
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
  } as const;
  const red = {
    iconColor: "text-red-400",
    bgColor: "bg-red-500/10",
  } as const;
  const purple = {
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
  } as const;
  const zinc = {
    iconColor: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
  } as const;

  switch (normalizedType) {
    case "GIG_COMPLETED":
      return {
        icon: PartyPopper,
        title: "Gig Completed",
        cta: "Leave Review",
        ...green,
      };
    case "GIG_APPLICATION_ACCEPTED":
    case "PROFILE_APPROVED":
      return {
        icon: CheckCircle2,
        title:
          normalizedType === "GIG_APPLICATION_ACCEPTED"
            ? "Application Accepted"
            : "Profile Approved",
        cta: "View",
        ...green,
      };
    case "EVENT_COMPLETED":
      return {
        icon: Calendar,
        title: "Event Over",
        cta: "Review DJs",
        ...purple,
      };
    case "DJ_NEW_EVENT":
      return {
        icon: CalendarHeart,
        title: "New Event",
        cta: "View",
        ...purple,
      };
    case "REVIEW_REMINDER":
      return {
        icon: Clock,
        title: "Review Reminder",
        cta: "Leave Review",
        ...amber,
      };
    case "PROFILE_REJECTED":
      return {
        icon: AlertCircle,
        title: "Profile Needs Review",
        cta: "View",
        ...amber,
      };
    case "REVIEW_EXPIRING":
      return {
        icon: AlertCircle,
        title: "Review Expiring Soon",
        cta: "Review Now",
        ...red,
      };
    case "GIG_APPLICATION_REJECTED":
    case "GIG_CANCELLED":
    case "GIG_NO_SHOW":
    case "REPORT_SUBMITTED":
    case "ACCOUNT_SUSPENDED":
      return {
        icon:
          normalizedType === "GIG_APPLICATION_REJECTED" ||
          normalizedType === "GIG_CANCELLED"
            ? XCircle
            : normalizedType === "GIG_NO_SHOW"
              ? Ban
              : normalizedType === "ACCOUNT_SUSPENDED"
                ? ShieldAlert
                : Flag,
        title:
          normalizedType === "GIG_APPLICATION_REJECTED"
            ? "Application Not Selected"
            : normalizedType === "GIG_CANCELLED"
              ? "Gig Cancelled"
              : normalizedType === "GIG_NO_SHOW"
                ? "No-Show Reported"
                : normalizedType === "ACCOUNT_SUSPENDED"
                  ? "Account Suspended"
                  : "Report Submitted",
        cta:
          normalizedType === "ACCOUNT_SUSPENDED" ? "Contact Support" : "View",
        ...red,
      };
    case "NEW_RATING":
      return {
        icon: Star,
        title: "New Rating",
        cta: "View",
        ...amber,
      };
    case "GIG_APPLICATION_RECEIVED":
      return {
        icon: Inbox,
        title: "New Application",
        cta: "View Application",
        ...blue,
      };
    case "GIG_APPLICATION_SHORTLISTED":
      return {
        icon: Bookmark,
        title: "Shortlisted",
        cta: "View",
        ...blue,
      };
    case "GIG_APPLICATION_WITHDRAWN":
      return {
        icon: Undo2,
        title: "Application Withdrawn",
        cta: "View",
        ...zinc,
      };
    case "BOOKING_INQUIRY":
      return {
        icon: Inbox,
        title: "New Booking Request",
        cta: "Review",
        ...blue,
      };
    case "BOOKING_INQUIRY_RESPONSE":
      return {
        icon: CheckCircle2,
        title: "Booking Update",
        cta: "Open",
        ...green,
      };
    case "BOOKING_INQUIRY_MESSAGE":
      return {
        icon: MessageCircle,
        title: "New Booking Message",
        cta: "Reply",
        ...purple,
      };
    case "NEW_COMMENT":
      return {
        icon: MessageCircle,
        title: "New Comment",
        cta: "View",
        ...blue,
      };
    case "NEW_REPLY":
      return {
        icon: Reply,
        title: "New Reply",
        cta: "View",
        ...blue,
      };
    case "DJ_REGISTRATION":
      return {
        icon: Headphones,
        title: "New DJ Registration",
        cta: "Review",
        ...purple,
      };
    case "GIG_PUBLISHED":
    case "GIG_NEW_MATCH":
      return {
        icon: normalizedType === "GIG_PUBLISHED" ? Megaphone : Target,
        title: "New Gig Match",
        cta: "View",
        ...blue,
      };
    case "DJ_NEW_MEDIA":
      return {
        icon: Play,
        title: "New Media",
        cta: "View",
        ...purple,
      };
    case "DJ_PROFILE_UPDATED":
      return {
        icon: User,
        title: "Profile Updated",
        cta: "View",
        ...zinc,
      };
    case "WELCOME":
      return {
        icon: Hand,
        title: "Welcome",
        cta: "Get Started",
        ...zinc,
      };
    case "BOOKING_INQUIRY":
      return {
        icon: Mail,
        title: "Booking Inquiry",
        cta: "View",
        ...blue,
      };
    default:
      return {
        icon: Star,
        title: "Notification",
        cta: null,
        ...zinc,
      };
  }
}
