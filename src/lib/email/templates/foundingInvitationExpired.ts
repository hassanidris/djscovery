import { baseLayout, escapeHtml } from "./base";

export const foundingInvitationExpiredSubject =
  "Your Founding DJ invitation has expired";

export function foundingInvitationExpiredEmail(data: { name: string }): string {
  return baseLayout(`
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">Your invitation has expired</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">Hi ${escapeHtml(data.name)},</p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">The invitation for your approved Founding DJ application has expired. If you still want to join, contact our support team and an administrator can review your invitation.</p>
    <p style="color:#9ca3af;font-size:16px;margin:0;line-height:1.6;">Best regards,<br />The DJcovery Team</p>
  `);
}
