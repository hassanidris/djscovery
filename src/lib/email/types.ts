export type EmailNotificationType =
  | "EVENT_ATTENDANCE"
  | "EVENT_REMINDER"
  | "DJ_REVIEW"
  | "DJ_FOLLOW"
  | "GIG_APPLICATION"
  | "GIG_APPLICATION_UPDATE"
  | "NEW_EVENT";

export interface EmailNotification {
  type: EmailNotificationType;
  to: string; // recipient email
  subject: string;
  data: Record<string, any>;
}

export interface EventAttendanceData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventUrl: string;
  status: "GOING" | "INTERESTED";
}

export interface EventReminderData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventUrl: string;
}

export interface DjReviewData {
  djName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  eventTitle: string;
  reviewUrl: string;
}

export interface DjFollowData {
  djName: string;
  followerName: string;
  followerProfileUrl: string;
}

export interface GigApplicationData {
  organizerName: string;
  djName: string;
  djProfileUrl: string;
  gigTitle: string;
  gigDate: string;
  applicationUrl: string;
}

export interface GigApplicationUpdateData {
  djName: string;
  gigTitle: string;
  gigDate: string;
  status: "ACCEPTED" | "REJECTED" | "PENDING";
  gigUrl: string;
}

export interface NewEventData {
  djName: string;
  eventTitle: string;
  eventDate: string;
  eventCategory: string;
  eventUrl: string;
}
