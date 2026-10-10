import { baseLayout, escapeHtml } from "./base";

interface PremiumExpiring7DaysParams {
  name: string;
  expiryDate: string;
  isFoundingMember: boolean;
}

export function premiumExpiring7DaysSubject(): string {
  return "Your DJcovery Premium Expires in 7 Days";
}

export function premiumExpiring7DaysHtml({
  name,
  expiryDate,
  isFoundingMember,
}: PremiumExpiring7DaysParams): string {
  const escapedName = escapeHtml(name);
  const message = isFoundingMember
    ? "Your complimentary 12-month premium period ends in 7 days. After expiry, you'll return to your Founding Member benefits (permanent badge and priority boost)."
    : "Your premium subscription ends in 7 days. After expiry, your account will return to the free tier.";

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px 0;">
      Premium Expires in 7 Days
    </h1>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hi ${escapedName},
    </p>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Your DJcovery Premium access will expire on <strong style="color:#fbbf24;">${expiryDate}</strong>.
    </p>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      ${message}
    </p>
    ${!isFoundingMember ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td align="center">
          <a href="https://djcovery.com/dj/dashboard/settings" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 32px;border-radius:8px;">
            Renew Premium
          </a>
        </td>
      </tr>
    </table>
    ` : ''}
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0 0;">
      Questions? Contact us at support@djcovery.com
    </p>
  `);
}
