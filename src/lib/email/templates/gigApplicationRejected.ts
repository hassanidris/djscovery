import { baseLayout, escapeHtml } from "./base";

export const gigApplicationRejectedSubject = "Update on your gig application";

export function gigApplicationRejectedHtml({
  djName,
  gigTitle,
}: {
  djName: string;
  gigTitle: string;
}): string {
  const safeDj = escapeHtml(djName);
  const safeGig = escapeHtml(gigTitle);
  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      Application update, ${safeDj}
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Unfortunately, your application to <strong style="color:#d1d5db;">&ldquo;${safeGig}&rdquo;</strong>
      was not selected this time. Don&rsquo;t be discouraged &mdash; there are plenty of open gigs
      on DJcovery waiting for you.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="https://djcovery.com/gigs"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Browse open gigs →
          </a>
        </td>
      </tr>
    </table>
  `);
}
