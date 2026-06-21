import { baseLayout } from "./base";

export const securityAlertSubject = "Your DJcovery password was changed";

export function securityAlertEmailHtml({ name }: { name: string }): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://djcovery.com";
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const timestamp = new Date().toUTCString();

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 12px;">
      🔐 Password changed
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi ${displayName}, your DJcovery account password was successfully updated on
      <strong style="color:#d1d5db;">${timestamp}</strong>.
    </p>
    <div style="background:#1f1f1f;border:1px solid #ef4444;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="color:#fca5a5;font-size:14px;margin:0;line-height:1.6;">
        <strong>Didn't make this change?</strong><br />
        If you didn't request a password change, your account may be compromised.
        Reset your password immediately.
      </p>
    </div>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${baseUrl}/forgot-password"
             style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Reset password now
          </a>
        </td>
      </tr>
    </table>
  `);
}
