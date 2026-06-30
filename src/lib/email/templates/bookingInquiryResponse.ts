import { baseLayout, escapeHtml } from "./base";

export const bookingInquiryResponseSubject =
  "Update on your DJ booking request";

export function bookingInquiryResponseHtml({
  organizerName,
  djName,
  eventName,
  status,
  note,
  ctaUrl,
}: {
  organizerName: string;
  djName: string;
  eventName: string;
  status: "ACCEPTED" | "DECLINED";
  note?: string | null;
  ctaUrl: string;
}): string {
  const safeOrganizer = escapeHtml(organizerName);
  const safeDj = escapeHtml(djName);
  const safeEvent = escapeHtml(eventName);
  const safeNote = note ? escapeHtml(note) : null;
  const accepted = status === "ACCEPTED";

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      ${accepted ? "Good news!" : "Update on your request"}
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 18px;">
      Hi ${safeOrganizer}, <strong style="color:#d1d5db;">${safeDj}</strong>
      has ${accepted ? "accepted" : "declined"} your booking request for
      <strong style="color:#d1d5db;">&ldquo;${safeEvent}&rdquo;</strong>.
    </p>
    ${
      safeNote
        ? `<p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 18px;">
            Message from ${safeDj}:<br />
            <span style="display:inline-block;margin-top:8px;padding:12px 16px;background:#111827;border-radius:10px;color:#d1d5db;">${safeNote}</span>
          </p>`
        : ""
    }
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      ${
        accepted
          ? "Their direct contact details are now visible inside the booking thread so you can coordinate next steps."
          : "Feel free to message them back if you have follow-up questions or would like to explore other dates."
      }
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <a href="${escapeHtml(ctaUrl)}"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            View conversation →
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0;">
      Replies stay inside DJcovery to protect both parties until you agree to move off-platform.
    </p>
  `);
}
