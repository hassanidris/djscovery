import { baseLayout, escapeHtml } from "./base";

export const accountSuspendedSubject = "Your DJcovery account has been suspended";

export function accountSuspendedHtml({
  name,
  reason,
}: {
  name: string;
  reason?: string | null;
}): string {
  const displayName = escapeHtml(name);
  const reasonBlock = reason
    ? `<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 20px;padding:12px 16px;background:#111111;border-left:3px solid #e11d48;border-radius:4px;">
        <strong style="color:#d1d5db;">Reason:</strong> ${escapeHtml(reason)}
      </p>`
    : "";
  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      Account suspended
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi ${displayName}, your DJcovery account has been suspended by our moderation team.
    </p>
    ${reasonBlock}
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0;">
      If you believe this is a mistake, please contact us at
      <a href="mailto:support@djcovery.com" style="color:#e11d48;">support@djcovery.com</a>.
    </p>
  `);
}
