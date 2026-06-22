import { baseLayout, escapeHtml } from "./base";

export const profileRejectedSubject = "Update on your DJ profile application";

export function profileRejectedHtml({
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
      Hi ${displayName}, an update on your profile
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 20px;">
      After review, your DJ profile on DJcovery was not approved at this time.
    </p>
    ${reasonBlock}
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      You can update your profile and resubmit for review at any time.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="https://djcovery.com/dashboard"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Update your profile →
          </a>
        </td>
      </tr>
    </table>
  `);
}
