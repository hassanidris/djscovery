import { baseLayout, escapeHtml } from "./base";

interface PremiumExpiredParams {
  name: string;
  isFoundingMember: boolean;
}

export function premiumExpiredSubject(): string {
  return "Your DJcovery Premium Has Expired";
}

export function premiumExpiredHtml({
  name,
  isFoundingMember,
}: PremiumExpiredParams): string {
  const escapedName = escapeHtml(name);
  const title = isFoundingMember
    ? "Premium Expired - Back to Founding Benefits"
    : "Premium Expired";
  const message = isFoundingMember
    ? "Your complimentary 12-month premium period has ended. You now have access to your permanent Founding Member benefits: your founding badge and priority search ranking. Thank you for being an early supporter!"
    : "Your premium subscription has ended. Your account has returned to the free tier. You can still use basic features, but premium benefits are no longer available.";

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px 0;">
      ${title}
    </h1>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hi ${escapedName},
    </p>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      ${message}
    </p>
    ${!isFoundingMember ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td align="center">
          <a href="https://djcovery.com/dj/dashboard/settings" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 32px;border-radius:8px;">
            Upgrade to Premium
          </a>
        </td>
      </tr>
    </table>
    ` : `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td align="center">
          <a href="https://djcovery.com/dj/dashboard" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 32px;border-radius:8px;">
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
    `}
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0 0;">
      Questions? Contact us at support@djcovery.com
    </p>
  `);
}
