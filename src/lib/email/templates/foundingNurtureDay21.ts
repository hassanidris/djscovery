import { baseLayout } from "./base";

export function foundingNurtureDay21Email(data: {
  name: string;
  statusUrl: string;
}): string {
  const content = `
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">Decision Coming Soon</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Hi ${data.name},
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      We're in the final stages of reviewing founding DJ applications. You should receive a decision on your application very soon.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      <strong>If approved:</strong> You'll receive an invitation to create your DJ profile and activate your founding status, including 12 months of premium and priority discovery.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      <strong>If not approved:</strong> You can reapply after 30 days. We'll provide feedback to help you strengthen your application for next time.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Thank you for your interest in joining the founding DJ community. We appreciate your patience as we carefully review each application.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${data.statusUrl}" style="background:#e11d48;color:#fff;font-size:16px;font-weight:600;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">
            Check Application Status
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 8px 0;line-height:1.6;">
      Best regards,<br />
      The Djscovery Team
    </p>
  `;

  return baseLayout(content);
}
