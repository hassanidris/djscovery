import { baseLayout, escapeHtml } from "./base";

export const bookingInquiryReceivedSubject = "New booking request on DJcovery";

export function bookingInquiryReceivedHtml({
  djName,
  organizerName,
  eventName,
  eventDate,
  location,
  ctaUrl,
}: {
  djName: string;
  organizerName: string;
  eventName: string;
  eventDate?: string | null;
  location?: string | null;
  ctaUrl: string;
}): string {
  const safeDj = escapeHtml(djName);
  const safeOrganizer = escapeHtml(organizerName);
  const safeEvent = escapeHtml(eventName);
  const safeDate = eventDate ? escapeHtml(eventDate) : null;
  const safeLocation = location ? escapeHtml(location) : null;

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      New booking request 📆
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 18px;">
      Hi ${safeDj}, <strong style="color:#d1d5db;">${safeOrganizer}</strong>
      just requested to book you for <strong style="color:#d1d5db;">&ldquo;${safeEvent}&rdquo;</strong>.
    </p>
    ${
      safeDate
        ? `<p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 18px;">
            Requested date: <strong style="color:#d1d5db;">${safeDate}</strong>
          </p>`
        : ""
    }
    ${
      safeLocation
        ? `<p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 18px;">
            Location: <strong style="color:#d1d5db;">${safeLocation}</strong>
          </p>`
        : ""
    }
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Review the details and respond inside DJcovery within 48 hours.
      All messages stay on-platform until you accept the booking.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <a href="${escapeHtml(ctaUrl)}"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            View inquiry →
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0;">
      The organizer's contact details will unlock automatically once you accept the booking request.
    </p>
  `);
}
