type FormattedNotification = {
  icon: string;
  message: string;
  link: string | null;
};

export function formatNotification(
  type: unknown,
  data?: unknown,
): FormattedNotification {
  const d = (data ?? {}) as Record<string, unknown>;
  const normalizedType = typeof type === "string" ? type : "UNKNOWN";

  switch (normalizedType) {
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
    case "BOOKING_INQUIRY": {
      const inquiryId = typeof d.inquiryId === "number" ? d.inquiryId : null;
      const organizerName =
        typeof d.organizerName === "string" && d.organizerName.length > 0
          ? d.organizerName
          : "An organizer";
      const eventName =
        typeof d.eventName === "string" && d.eventName.length > 0
          ? d.eventName
          : "a booking";
      return {
        icon: "📆",
        message: `${organizerName} wants to book you for "${eventName}".`,
        link: inquiryId
          ? `/dashboard/dj/bookings?inquiry=${inquiryId}`
          : "/dashboard/dj/bookings",
      };
    }
    case "BOOKING_INQUIRY_RESPONSE": {
      const inquiryId = typeof d.inquiryId === "number" ? d.inquiryId : null;
      const eventName =
        typeof d.eventName === "string" && d.eventName.length > 0
          ? d.eventName
          : "your booking";
      const status =
        typeof d.status === "string" && d.status.length > 0
          ? d.status
          : "UPDATED";
      const djName =
        typeof d.djName === "string" && d.djName.length > 0
          ? d.djName
          : "The DJ";
      const statusLabel =
        status === "ACCEPTED"
          ? "accepted"
          : status === "DECLINED"
            ? "declined"
            : "updated";
      return {
        icon:
          status === "ACCEPTED" ? "✅" : status === "DECLINED" ? "❌" : "📨",
        message: `${djName} ${statusLabel} your request for "${eventName}".`,
        link: inquiryId
          ? `/organizer/bookings?inquiry=${inquiryId}`
          : "/organizer/bookings",
      };
    }
    case "BOOKING_INQUIRY_MESSAGE": {
      const inquiryId = typeof d.inquiryId === "number" ? d.inquiryId : null;
      const eventName =
        typeof d.eventName === "string" && d.eventName.length > 0
          ? d.eventName
          : "your booking";
      const senderName =
        typeof d.senderName === "string" && d.senderName.length > 0
          ? d.senderName
          : "Someone";
      const senderRole = d.senderRole === "DJ" ? "DJ" : "organizer";
      const linkBase =
        senderRole === "DJ" ? "/organizer/bookings" : "/dashboard/dj/bookings";
      return {
        icon: "💬",
        message: `${senderName} replied in the "${eventName}" booking.`,
        link: inquiryId ? `${linkBase}?inquiry=${inquiryId}` : linkBase,
      };
    }
    case "NEW_RATING": {
      const rating = typeof d.rating === "number" ? d.rating : null;
      const gigTitle = typeof d.gigTitle === "string" ? d.gigTitle : null;
      const eventTitle = typeof d.eventTitle === "string" ? d.eventTitle : null;
      const reviewerName =
        typeof d.reviewerName === "string" ? d.reviewerName : null;
      const reviewerType =
        typeof d.reviewerType === "string" ? d.reviewerType : null;
      const title = gigTitle ?? eventTitle ?? "a gig/event";
      const source = reviewerName
        ? `${reviewerName} left a ${rating ?? "new"}-star review`
        : reviewerType === "fan"
          ? `A fan left a ${rating ?? "new"}-star review`
          : "You received a new rating";
      return {
        icon: "⭐",
        message: `${source} for "${title}".`,
        link: "/dashboard/dj",
      };
    }
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
    case "GIG_COMPLETED": {
      const gigTitle = typeof d.gigTitle === "string" ? d.gigTitle : "Your gig";
      const djName = typeof d.djName === "string" ? d.djName : "the DJ";
      const gigSlug = typeof d.gigSlug === "string" ? d.gigSlug : null;
      return {
        icon: "🎉",
        message: `Your gig "${gigTitle}" was marked complete. Leave a review for ${djName}.`,
        link: gigSlug ? `/gigs/${gigSlug}/review` : null,
      };
    }
    case "GIG_CANCELLED": {
      const gigTitle = typeof d.gigTitle === "string" ? d.gigTitle : "A gig";
      const cancelledBy =
        typeof d.cancelledBy === "string" ? d.cancelledBy : null;
      const gigSlug = typeof d.gigSlug === "string" ? d.gigSlug : null;
      return {
        icon: "❌",
        message: cancelledBy
          ? `Gig "${gigTitle}" was cancelled by the ${cancelledBy.toLowerCase()}.`
          : `Gig "${gigTitle}" was cancelled.`,
        link: gigSlug ? `/gigs/${gigSlug}` : "/organizer/gigs",
      };
    }
    case "GIG_NO_SHOW": {
      const gigTitle = typeof d.gigTitle === "string" ? d.gigTitle : "A gig";
      const gigSlug = typeof d.gigSlug === "string" ? d.gigSlug : null;
      return {
        icon: "🚫",
        message: `You were reported as a no-show for "${gigTitle}".`,
        link: gigSlug ? `/gigs/${gigSlug}` : null,
      };
    }
    case "EVENT_COMPLETED": {
      const eventTitle =
        typeof d.eventTitle === "string" ? d.eventTitle : "The event";
      const eventSlug = typeof d.eventSlug === "string" ? d.eventSlug : null;
      return {
        icon: "🎉",
        message: `Event "${eventTitle}" is over. Review the DJs you saw.`,
        link: eventSlug ? `/events/${eventSlug}` : null,
      };
    }
    case "REVIEW_REMINDER": {
      const daysLeft = typeof d.daysLeft === "number" ? d.daysLeft : 0;
      const djName = typeof d.djName === "string" ? d.djName : "the DJ";
      const gigSlug = typeof d.gigSlug === "string" ? d.gigSlug : null;
      const eventSlug = typeof d.eventSlug === "string" ? d.eventSlug : null;
      return {
        icon: "⏰",
        message: `Reminder: You have ${daysLeft} days left to review ${djName}.`,
        link: gigSlug
          ? `/gigs/${gigSlug}/review`
          : eventSlug
            ? `/events/${eventSlug}`
            : null,
      };
    }
    case "REVIEW_EXPIRING": {
      const daysLeft = typeof d.daysLeft === "number" ? d.daysLeft : 0;
      const djName = typeof d.djName === "string" ? d.djName : "the DJ";
      const gigSlug = typeof d.gigSlug === "string" ? d.gigSlug : null;
      const eventSlug = typeof d.eventSlug === "string" ? d.eventSlug : null;
      return {
        icon: "⏰",
        message: `Your review window for ${djName} expires in ${daysLeft} days.`,
        link: gigSlug
          ? `/gigs/${gigSlug}/review`
          : eventSlug
            ? `/events/${eventSlug}`
            : null,
      };
    }
    default:
      return { icon: "🔔", message: "New notification", link: null };
  }
}
