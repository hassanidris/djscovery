import type { NotificationType } from "@prisma/client";

type FormattedNotification = {
  icon: string;
  message: string;
  link: string | null;
};

export function formatNotification(
  type: NotificationType,
  data?: unknown,
): FormattedNotification {
  const d = (data ?? {}) as Record<string, unknown>;

  switch (type) {
    case "NEW_COMMENT":
      return {
        icon: "💬",
        message: "Someone commented on your post",
        link: "/community",
      };
    case "NEW_REPLY":
      return {
        icon: "↩️",
        message: "Someone replied to your comment",
        link: "/community",
      };
    case "NEW_RATING":
      return {
        icon: "⭐",
        message: "You received a new rating",
        link: "/dashboard/dj",
      };
    case "DJ_REGISTRATION":
      return {
        icon: "🎛️",
        message: "A new DJ has registered",
        link: "/admin/djs",
      };
    case "GIG_PUBLISHED": {
      const gigId = typeof d.gigId === "number" ? d.gigId : null;
      return {
        icon: "📢",
        message: "A new gig matching your profile was posted",
        link: gigId ? `/dashboard/dj/gigs/${gigId}` : "/dashboard/dj/gigs",
      };
    }
    case "GIG_APPLICATION_RECEIVED": {
      const gigId = typeof d.gigId === "number" ? d.gigId : null;
      return {
        icon: "📩",
        message: "Someone applied to your gig",
        link: gigId
          ? `/dashboard/organizer/gigs/${gigId}`
          : "/dashboard/organizer/gigs",
      };
    }
    case "GIG_APPLICATION_SHORTLISTED":
      return {
        icon: "🔖",
        message: "Your application has been shortlisted",
        link: "/dashboard/dj/applications",
      };
    case "GIG_APPLICATION_ACCEPTED":
      return {
        icon: "✅",
        message: "Your application was accepted!",
        link: "/dashboard/dj/applications",
      };
    case "GIG_APPLICATION_REJECTED":
      return {
        icon: "❌",
        message: "Your application was not selected",
        link: "/dashboard/dj/applications",
      };
    case "GIG_APPLICATION_WITHDRAWN": {
      const gigId = typeof d.gigId === "number" ? d.gigId : null;
      return {
        icon: "↩️",
        message: "An applicant withdrew their application",
        link: gigId
          ? `/dashboard/organizer/gigs/${gigId}`
          : "/dashboard/organizer/gigs",
      };
    }
    case "DJ_NEW_EVENT": {
      const eventSlug = typeof d.eventSlug === "string" ? d.eventSlug : null;
      return {
        icon: "🎉",
        message: "A DJ you follow has a new event",
        link: eventSlug ? `/events/${eventSlug}` : "/events",
      };
    }
    case "WELCOME":
      return {
        icon: "👋",
        message: "Welcome to DJcovery!",
        link: "/dashboard",
      };
    case "PROFILE_APPROVED":
      return {
        icon: "✅",
        message: "Your profile has been approved",
        link: "/dashboard/dj",
      };
    case "PROFILE_REJECTED":
      return {
        icon: "🔎",
        message: "Your profile needs some adjustments",
        link: "/dashboard/dj",
      };
    case "GIG_NEW_MATCH": {
      const gigId = typeof d.gigId === "number" ? d.gigId : null;
      return {
        icon: "🎯",
        message: "A new gig matches your profile",
        link: gigId ? `/dashboard/dj/gigs/${gigId}` : "/dashboard/dj/gigs",
      };
    }
    case "BOOKING_INQUIRY":
      return {
        icon: "📋",
        message: "You have a new booking inquiry",
        link: "/dashboard",
      };
    case "ACCOUNT_SUSPENDED":
      return {
        icon: "⚠️",
        message: "Your account has been suspended",
        link: "/account/settings",
      };
    case "REPORT_SUBMITTED":
      return {
        icon: "🚩",
        message: "A new report has been submitted",
        link: "/admin/reports",
      };
    default:
      return { icon: "🔔", message: "New notification", link: null };
  }
}
