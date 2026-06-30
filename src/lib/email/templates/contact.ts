import { baseLayout, escapeHtml } from "./base";

export function contactInternalEmailSubject(category: string): string {
  return `[Contact] ${category} — new message via DJcovery`;
}

export function contactInternalEmailHtml({
  name,
  email,
  category,
  message,
}: {
  name: string;
  email: string;
  category: string;
  message: string;
}): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCategory = escapeHtml(category);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;">
      New contact message
    </h1>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
          <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:2px;">From</span>
          <span style="color:#ffffff;font-size:14px;">${safeName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
          <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:2px;">Email</span>
          <a href="mailto:${safeEmail}" style="color:#d30101;font-size:14px;text-decoration:none;">${safeEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
          <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:2px;">Category</span>
          <span style="color:#ffffff;font-size:14px;">${safeCategory}</span>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Message</p>
    <div style="background:#111111;border:1px solid #2a2a2a;border-radius:8px;padding:16px;">
      <p style="color:#d1d5db;font-size:14px;line-height:1.8;margin:0;">${safeMessage}</p>
    </div>
    <p style="color:#6b7280;font-size:12px;margin:24px 0 0;">
      Reply directly to this email — your reply will go to ${safeEmail}.
    </p>
  `);
}

export function contactAutoReplySubject(): string {
  return "We received your message — DJcovery";
}

export function contactAutoReplyHtml({ name }: { name: string }): string {
  const safeName = escapeHtml(
    name.charAt(0).toUpperCase() + name.slice(1),
  );

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      Thanks for reaching out, ${safeName}!
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 20px;">
      We've received your message and will get back to you within <strong style="color:#ffffff;">1–2 business days</strong>.
    </p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 28px;">
      In the meantime, feel free to explore DJcovery — discover DJs, browse gigs, and more.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://djcovery.com"}"
             style="display:inline-block;background:#d30101;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Explore DJcovery →
          </a>
        </td>
      </tr>
    </table>
  `);
}
