import type {
  EventAttendanceData,
  EventReminderData,
  DjReviewData,
  DjFollowData,
  GigApplicationData,
  GigApplicationUpdateData,
  NewEventData,
} from "./types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djscovery.com";

function baseTemplate(htmlContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DJcovery</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%); padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 30px; }
    .content p { line-height: 1.6; color: #a0a0a0; margin: 0 0 20px 0; }
    .content h2 { color: #ffffff; margin: 0 0 15px 0; font-size: 20px; }
    .button { display: inline-block; background-color: #ff4757; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
    .button:hover { background-color: #ff6b81; }
    .footer { background-color: #0a0a0a; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .footer a { color: #ff4757; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DJcovery</h1>
    </div>
    <div class="content">
      ${htmlContent}
    </div>
    <div class="footer">
      <p>You're receiving this email because you're part of the DJcovery community.</p>
      <p><a href="${SITE_URL}/unsubscribe">Unsubscribe</a> | <a href="${SITE_URL}">Visit DJcovery</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

export function eventAttendanceTemplate(data: EventAttendanceData): {
  subject: string;
  html: string;
} {
  const statusText = data.status === "GOING" ? "going to" : "interested in";
  const html = `
    <h2>You're ${statusText} an event!</h2>
    <p>Hi ${data.userName},</p>
    <p>You've marked yourself as <strong>${data.status}</strong> for:</p>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.eventTitle}</p>
    <p><strong>Date:</strong> ${data.eventDate}</p>
    <a href="${data.eventUrl}" class="button">View Event</a>
  `;
  return {
    subject: `You're ${statusText} ${data.eventTitle}`,
    html: baseTemplate(html),
  };
}

export function eventReminderTemplate(data: EventReminderData): {
  subject: string;
  html: string;
} {
  const html = `
    <h2>Event Reminder</h2>
    <p>Hi ${data.userName},</p>
    <p>This is a friendly reminder that you're going to:</p>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.eventTitle}</p>
    <p><strong>Date:</strong> ${data.eventDate}</p>
    <p><strong>Time:</strong> ${data.eventTime}</p>
    <p><strong>Location:</strong> ${data.eventLocation}</p>
    <a href="${data.eventUrl}" class="button">View Event Details</a>
  `;
  return {
    subject: `Reminder: ${data.eventTitle} is tomorrow!`,
    html: baseTemplate(html),
  };
}

export function djReviewTemplate(data: DjReviewData): {
  subject: string;
  html: string;
} {
  const html = `
    <h2>New Review Received</h2>
    <p>Hi ${data.djName},</p>
    <p>You've received a new review from <strong>${data.reviewerName}</strong>:</p>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.eventTitle}</p>
    <p><strong>Rating:</strong> ${"★".repeat(data.rating)}${"☆".repeat(5 - data.rating)}</p>
    <p><strong>Comment:</strong> ${data.comment}</p>
    <a href="${data.reviewUrl}" class="button">View Review</a>
  `;
  return {
    subject: `New review from ${data.reviewerName}`,
    html: baseTemplate(html),
  };
}

export function djFollowTemplate(data: DjFollowData): {
  subject: string;
  html: string;
} {
  const html = `
    <h2>New Follower</h2>
    <p>Hi ${data.djName},</p>
    <p><strong>${data.followerName}</strong> is now following you!</p>
    <a href="${data.followerProfileUrl}" class="button">View Profile</a>
  `;
  return {
    subject: `${data.followerName} is now following you`,
    html: baseTemplate(html),
  };
}

export function gigApplicationTemplate(data: GigApplicationData): {
  subject: string;
  html: string;
} {
  const html = `
    <h2>New Gig Application</h2>
    <p>Hi ${data.organizerName},</p>
    <p><strong>${data.djName}</strong> has applied to your gig:</p>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.gigTitle}</p>
    <p><strong>Date:</strong> ${data.gigDate}</p>
    <a href="${data.applicationUrl}" class="button">Review Application</a>
  `;
  return {
    subject: `New application for ${data.gigTitle}`,
    html: baseTemplate(html),
  };
}

export function gigApplicationUpdateTemplate(data: GigApplicationUpdateData): {
  subject: string;
  html: string;
} {
  const statusColor = data.status === "ACCEPTED" ? "#10b981" : data.status === "REJECTED" ? "#ef4444" : "#f59e0b";
  const html = `
    <h2>Application Status Update</h2>
    <p>Hi ${data.djName},</p>
    <p>Your application for <strong>${data.gigTitle}</strong> has been updated:</p>
    <p style="color: ${statusColor}; font-size: 18px; font-weight: 600;">${data.status}</p>
    <p><strong>Gig Date:</strong> ${data.gigDate}</p>
    <a href="${data.gigUrl}" class="button">View Gig Details</a>
  `;
  return {
    subject: `Application ${data.status}: ${data.gigTitle}`,
    html: baseTemplate(html),
  };
}

export function newEventTemplate(data: NewEventData): {
  subject: string;
  html: string;
} {
  const html = `
    <h2>New Event from ${data.djName}</h2>
    <p>Hi there,</p>
    <p><strong>${data.djName}</strong> just announced a new event:</p>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.eventTitle}</p>
    <p><strong>Category:</strong> ${data.eventCategory}</p>
    <p><strong>Date:</strong> ${data.eventDate}</p>
    <a href="${data.eventUrl}" class="button">View Event</a>
  `;
  return {
    subject: `New event: ${data.eventTitle}`,
    html: baseTemplate(html),
  };
}
