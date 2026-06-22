import { baseLayout, escapeHtml } from "./base";

export const gigApplicationAcceptedSubject =
  "Congratulations — your application was accepted! 🎉";

export function gigApplicationAcceptedHtml({
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
      You're in, ${safeDj}! ✅
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Your application to <strong style="color:#d1d5db;">&ldquo;${safeGig}&rdquo;</strong> has been
      <strong style="color:#22c55e;">accepted</strong>. The organizer will be in touch with further details.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="https://djcovery.com/dashboard/dj/applications"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            View your applications →
          </a>
        </td>
      </tr>
    </table>
  `);
}
