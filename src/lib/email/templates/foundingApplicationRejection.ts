import { baseLayout, escapeHtml } from "./base";

export const foundingApplicationRejectionSubject =
  "Update on your Founding DJ application";

export function foundingApplicationRejectionEmail(data: {
  name: string;
  reason: string;
  reapplyAt: Date;
}): string {
  const content = `
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">An update on your application</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">Hi ${escapeHtml(data.name)},</p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">Thank you for applying to become a Founding DJ. We aren't able to approve your application at this time.</p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;"><strong style="color:#fff;">Decision note:</strong> ${escapeHtml(data.reason)}</p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">You may submit a new application after ${escapeHtml(data.reapplyAt.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" }))}.</p>
    <p style="color:#9ca3af;font-size:16px;margin:0;line-height:1.6;">Best regards,<br />The DJcovery Team</p>
  `;

  return baseLayout(content);
}
