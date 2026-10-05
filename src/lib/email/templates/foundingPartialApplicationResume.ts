import { baseLayout } from "./base";

export function foundingPartialApplicationResumeEmail(data: {
  name: string;
  resumeUrl: string;
}): string {
  const content = `
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">Continue Your Application</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Hi ${data.name},
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      You started an application to become a founding DJ on DJcovery but didn't complete it. No worries—your progress has been saved!
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Click the button below to continue where you left off:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${data.resumeUrl}" style="background:#e11d48;color:#fff;font-size:16px;font-weight:600;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">
            Resume Application
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      This link will expire in 48 hours. After that, you'll need to start a new application.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 8px 0;line-height:1.6;">
      Best regards,<br />
      The DJcovery Team
    </p>
  `;

  return baseLayout(content);
}
