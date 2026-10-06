import { baseLayout, escapeHtml } from "./base";

export const foundingInvitationReminderSubject =
  "Your Founding DJ invitation expires soon";

export function foundingInvitationReminderEmail(data: {
  name: string;
  expiresAt: Date;
}): string {
  return baseLayout(`
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">Your invitation expires in 3 days</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">Hi ${escapeHtml(data.name)},</p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">Your Founding DJ application was approved. Accept your invitation before it expires on ${escapeHtml(data.expiresAt.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" }))}.</p>
    <p style="color:#9ca3af;font-size:14px;margin:0;line-height:1.6;">Use the invitation link from your original approval email and sign in or create an account with the invited email address. If you can&apos;t find that email, contact support and an administrator can send a replacement.</p>
  `);
}
