import { Resend } from "resend";
import type {
  EmailNotificationType,
  EventAttendanceData,
  EventReminderData,
  DjReviewData,
  DjFollowData,
  GigApplicationData,
  GigApplicationUpdateData,
  NewEventData,
} from "./types";
import {
  eventAttendanceTemplate,
  eventReminderTemplate,
  djReviewTemplate,
  djFollowTemplate,
  gigApplicationTemplate,
  gigApplicationUpdateTemplate,
  newEventTemplate,
} from "./templates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@djscovery.com";

interface SendEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export async function sendEmail(
  to: string,
  type: EmailNotificationType,
  data:
    | EventAttendanceData
    | EventReminderData
    | DjReviewData
    | DjFollowData
    | GigApplicationData
    | GigApplicationUpdateData
    | NewEventData
): Promise<SendEmailResult> {
  // Skip sending if Resend is not configured (development mode)
  if (!resend) {
    console.log(`[Email Mock] Would send ${type} email to ${to}:`, data);
    return { success: true };
  }

  try {
    let template: { subject: string; html: string };

    switch (type) {
      case "EVENT_ATTENDANCE":
        template = eventAttendanceTemplate(data as EventAttendanceData);
        break;
      case "EVENT_REMINDER":
        template = eventReminderTemplate(data as EventReminderData);
        break;
      case "DJ_REVIEW":
        template = djReviewTemplate(data as DjReviewData);
        break;
      case "DJ_FOLLOW":
        template = djFollowTemplate(data as DjFollowData);
        break;
      case "GIG_APPLICATION":
        template = gigApplicationTemplate(data as GigApplicationData);
        break;
      case "GIG_APPLICATION_UPDATE":
        template = gigApplicationUpdateTemplate(data as GigApplicationUpdateData);
        break;
      case "NEW_EVENT":
        template = newEventTemplate(data as NewEventData);
        break;
      default:
        return { success: false, error: `Unknown email type: ${type}` };
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (result.error) {
      console.error("Email send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
