import { baseLayout, escapeHtml } from "./base";

interface BetaAccessParams {
  name: string;
  foundingNumber: number;
  dashboardUrl: string;
}

export function betaAccessSubject(): string {
  return "Your DJcovery Beta Access is Here";
}

export function betaAccessHtml({
  name,
  foundingNumber,
  dashboardUrl,
}: BetaAccessParams): string {
  const escapedName = escapeHtml(name);

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px 0;">
      Welcome to the DJcovery Beta
    </h1>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hi ${escapedName},
    </p>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Congratulations! As Founding Member #${foundingNumber}, you now have exclusive beta access to DJcovery.
    </p>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      You can now:
    </p>
    <ul style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;padding-left:20px;">
      <li style="margin-bottom:12px;">
        Complete your DJ profile with media, genres, and availability
      </li>
      <li style="margin-bottom:12px;">
        Browse and apply to open gigs in your area
      </li>
      <li style="margin-bottom:12px;">
        Connect with organizers and build your reputation
      </li>
      <li style="margin-bottom:12px;">
        Explore the platform and share feedback with our team
      </li>
    </ul>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Your early feedback will help shape the future of DJ discovery. We're excited to have you on this journey with us.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td align="center">
          <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 32px;border-radius:8px;">
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0 0;">
      Questions? Just reply to this email — we're here to help.
    </p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0 0;">
      The DJcovery Team
    </p>
  `);
}
