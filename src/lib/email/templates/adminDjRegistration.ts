import { baseLayout, escapeHtml } from "./base";

export const adminDjRegistrationSubject = "New DJ registration — review required";

export function adminDjRegistrationHtml({
  stageName,
  adminUrl,
}: {
  stageName: string;
  adminUrl: string;
}): string {
  const safeStageName = escapeHtml(stageName);
  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      New DJ registration 🎛️
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      <strong style="color:#d1d5db;">${safeStageName}</strong> just submitted a DJ profile
      on DJcovery and is waiting for your review.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${adminUrl}"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Review in admin panel →
          </a>
        </td>
      </tr>
    </table>
  `);
}
