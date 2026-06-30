import { baseLayout, escapeHtml } from "./base";

export const bookingInquiryMessageSubject = "New message in your booking thread";

export function bookingInquiryMessageHtml({
  recipientName,
  counterpartName,
  eventName,
  messagePreview,
  ctaUrl,
}: {
  recipientName: string;
  counterpartName: string;
  eventName: string;
  messagePreview: string;
  ctaUrl: string;
}): string {
  const safeRecipient = escapeHtml(recipientName);
  const safeCounterpart = escapeHtml(counterpartName);
  const safeEvent = escapeHtml(eventName);
  const safePreview = escapeHtml(messagePreview);

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      New message in your booking 📨
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 18px;">
      Hi ${safeRecipient}, <strong style="color:#d1d5db;">${safeCounterpart}</strong>
      just replied in the <strong style="color:#d1d5db;">&ldquo;${safeEvent}&rdquo;</strong> booking thread.
    </p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      "${safePreview}"
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td>
          <a href="${escapeHtml(ctaUrl)}"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Open conversation →
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:13px;line-height:1.7;margin:0;">
      Email addresses stay hidden. Continue the conversation inside DJcovery until both of you agree otherwise.
    </p>
  `);
}
