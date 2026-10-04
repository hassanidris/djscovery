import { baseLayout } from "./base";

export function foundingEmailVerifiedEmail(data: {
  name: string;
  statusUrl: string;
}): string {
  const content = `
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">Email Verified</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Hi ${data.name},
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Your email has been successfully verified! Your application is now under review by our team.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      We aim to make decisions within 2 weeks. You can check your application status anytime using the link below:
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
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      If approved, you'll receive an invitation to create your DJ profile and activate your founding status.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 8px 0;line-height:1.6;">
      Best regards,<br />
      The Djscovery Team
    </p>
  `;

  return baseLayout(content);
}
