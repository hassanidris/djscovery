import { baseLayout, escapeHtml } from "./base";

export const gigApplicationReceivedSubject = "New application for your gig";

export function gigApplicationReceivedHtml({
  organizerName,
  gigTitle,
  djName,
}: {
  organizerName: string;
  gigTitle: string;
  djName: string;
}): string {
  const safeOrg = escapeHtml(organizerName);
  const safeGig = escapeHtml(gigTitle);
  const safeDj = escapeHtml(djName);
  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      New application received 📩
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Hi ${safeOrg}, <strong style="color:#d1d5db;">${safeDj}</strong> has applied to your gig
      <strong style="color:#d1d5db;">&ldquo;${safeGig}&rdquo;</strong>.
    </p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Head to your organizer dashboard to review the application and manage your applicants.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="https://djcovery.com/organizer/dashboard"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Review applications →
          </a>
        </td>
      </tr>
    </table>
  `);
}
