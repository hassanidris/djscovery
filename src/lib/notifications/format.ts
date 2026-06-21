import type { NotificationType } from "@prisma/client";

type FormattedNotification = { icon: string; message: string };

export function formatNotification(
  type: NotificationType,
): FormattedNotification {
  switch (type) {
    case "NEW_COMMENT":
      return { icon: "💬", message: "Someone commented on your post" };
    case "NEW_REPLY":
      return { icon: "↩️", message: "Someone replied to your comment" };
    case "NEW_RATING":
      return { icon: "⭐", message: "You received a new rating" };
    case "DJ_REGISTRATION":
      return { icon: "🎛️", message: "A new DJ has registered" };
    case "GIG_PUBLISHED":
      return { icon: "📢", message: "A new gig matching your profile was posted" };
    case "GIG_APPLICATION_RECEIVED":
      return { icon: "📩", message: "Someone applied to your gig" };
    case "GIG_APPLICATION_SHORTLISTED":
      return { icon: "🔖", message: "Your application has been shortlisted" };
    case "GIG_APPLICATION_ACCEPTED":
      return { icon: "✅", message: "Your application was accepted!" };
    case "GIG_APPLICATION_REJECTED":
      return { icon: "❌", message: "Your application was not selected" };
    case "GIG_APPLICATION_WITHDRAWN":
      return { icon: "↩️", message: "An applicant withdrew their application" };
    case "DJ_NEW_EVENT":
      return { icon: "🎉", message: "A DJ you follow has a new event" };
    case "WELCOME":
      return { icon: "👋", message: "Welcome to DJcovery!" };
    case "PROFILE_APPROVED":
      return { icon: "✅", message: "Your profile has been approved" };
    case "PROFILE_REJECTED":
      return { icon: "🔎", message: "Your profile needs some adjustments" };
    case "GIG_NEW_MATCH":
      return { icon: "🎯", message: "A new gig matches your profile" };
    case "BOOKING_INQUIRY":
      return { icon: "📋", message: "You have a new booking inquiry" };
    case "ACCOUNT_SUSPENDED":
      return { icon: "⚠️", message: "Your account has been suspended" };
    default:
      return { icon: "🔔", message: "New notification" };
  }
}
