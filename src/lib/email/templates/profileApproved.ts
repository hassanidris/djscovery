import { baseLayout, escapeHtml } from "./base";

export const profileApprovedSubject = "Your DJ profile has been approved! 🎉";

export function profileApprovedHtml({ name }: { name: string }): string {
  const displayName = escapeHtml(name);
  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      You're approved, ${displayName}! 🎉
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Your DJ profile on DJcovery has been reviewed and approved. You can now be discovered
      by organizers, apply to open gigs, and start building your audience.
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="https://djcovery.com/dashboard"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Go to your dashboard →
          </a>
        </td>
      </tr>
    </table>
  `);
}
