import { baseLayout, escapeHtml } from "./base";

interface LaunchAnnouncementParams {
  name: string;
  foundingNumber: number;
}

export function launchAnnouncementSubject(): string {
  return "DJcovery is Live! Your Founding Rewards Are Active";
}

export function launchAnnouncementHtml({
  name,
  foundingNumber,
}: LaunchAnnouncementParams): string {
  const escapedName = escapeHtml(name);

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px 0;">
      Welcome to the Future of DJ Discovery
    </h1>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hi ${escapedName},
    </p>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      DJcovery is now live! As Founding Member #${foundingNumber}, your exclusive rewards have been activated:
    </p>
    <ul style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;padding-left:20px;">
      <li style="margin-bottom:12px;">
        <strong style="color:#fbbf24;">12 Months Premium</strong> - Full access to all premium features
      </li>
      <li style="margin-bottom:12px;">
        <strong style="color:#fbbf24;">Priority Search Ranking</strong> - Be discovered first by organizers
      </li>
      <li style="margin-bottom:12px;">
        <strong style="color:#fbbf24;">Homepage Feature</strong> - Rotated weekly showcase for the next month
      </li>
      <li style="margin-bottom:12px;">
        <strong style="color:#fbbf24;">Founding Badge</strong> - Permanent badge displayed on your profile
      </li>
    </ul>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Your profile is now visible to organizers worldwide. Update your media, set your availability, and start getting booked!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td align="center">
          <a href="https://djcovery.com/dj/dashboard" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 32px;border-radius:8px;">
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0 0;">
      Thank you for being one of our founding members. Your early support means everything to us.
    </p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0 0;">
      The DJcovery Team
    </p>
  `);
}
