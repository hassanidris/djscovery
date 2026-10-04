import { baseLayout } from "./base";

export function foundingNurtureDay10Email(data: {
  name: string;
  statusUrl: string;
}): string {
  const content = `
    <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 16px 0;">Founding DJ Spotlight</h1>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      Hi ${data.name},
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      We wanted to share some exciting updates about the founding DJ program while we continue reviewing applications.
    </p>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      <strong>What makes founding DJs special:</strong>
    </p>
    <ul style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;padding-left:20px;">
      <li style="margin-bottom:8px;">12 months of premium access (unlimited mixes, press kit, analytics)</li>
      <li style="margin-bottom:8px;">12 months of priority discovery in search results</li>
      <li style="margin-bottom:8px;">Permanent gold founding badge on your profile</li>
      <li style="margin-bottom:8px;">Direct influence on platform features and development</li>
    </ul>
    <p style="color:#9ca3af;font-size:16px;margin:0 0 24px 0;line-height:1.6;">
      We're capping founding membership at 100 DJs to maintain exclusivity and badge value. Once approved, you'll be part of an elite group shaping the future of DJ discovery.
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
