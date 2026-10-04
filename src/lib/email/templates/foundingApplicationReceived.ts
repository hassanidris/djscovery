import { baseLayout } from "./base";

export function foundingApplicationReceivedEmail(data: {
  name: string;
  verifyUrl: string;
}): string {
  const content = `
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">Application Received</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Hi ${data.name},
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Thank you for applying to become a founding DJ on DJcovery! We've received your application and are excited to review it.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      To complete your application, please verify your email address by clicking the button below:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${data.verifyUrl}" style="background:#e11d48;color:#fff;font-size:16px;font-weight:600;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">
            Verify Email
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      This link will expire in 24 hours. If you didn't request this application, you can safely ignore this email.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Our team aims to review all applications within 2 weeks. You'll receive another email once a decision has been made.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 8px 0;line-height:1.6;">
      Best regards,<br />
      The DJcovery Team
    </p>
  `;

  return baseLayout(content);
}
