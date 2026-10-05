import { baseLayout, escapeHtml } from "./base";

export const foundingApplicationInvitationSubject =
  "Your Founding DJ application has been approved";

export function foundingApplicationInvitationEmail(data: {
  name: string;
  invitationUrl: string;
  expiresAt: Date;
}): string {
  const content = `
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">You're invited to join DJcovery</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">Hi ${escapeHtml(data.name)},</p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">Your application to become a Founding DJ has been approved. Use your personal invitation link to continue setting up your account.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td align="center"><a href="${data.invitationUrl}" style="background:#e11d48;color:#fff;font-size:16px;font-weight:600;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">Accept invitation</a></td></tr></table>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 24px 0;line-height:1.6;">This invitation expires on ${escapeHtml(data.expiresAt.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" }))}. If you didn't apply, you can ignore this email.</p>
    <p style="color:#9ca3af;font-size:16px;margin:0;line-height:1.6;">Best regards,<br />The DJcovery Team</p>
  `;

  return baseLayout(content);
}
