import { baseLayout, escapeHtml } from "./base";

interface ProgressUpdateParams {
  name: string;
  milestone: string;
  description: string;
  ctaUrl: string;
  ctaText: string;
}

export function progressUpdateSubject(): string {
  return "DJcovery Progress Update";
}

export function progressUpdateHtml({
  name,
  milestone,
  description,
  ctaUrl,
  ctaText,
}: ProgressUpdateParams): string {
  const escapedName = escapeHtml(name);
  const escapedMilestone = escapeHtml(milestone);
  const escapedDescription = escapeHtml(description);
  const escapedCtaText = escapeHtml(ctaText);

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 16px 0;">
      ${escapedMilestone}
    </h1>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hi ${escapedName},
    </p>
    <p style="color:#9ca3af;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      ${escapedDescription}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td align="center">
          <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 32px;border-radius:8px;">
            ${escapedCtaText}
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0 0;">
      Thank you for being part of DJcovery.
    </p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 0 0;">
      The DJcovery Team
    </p>
  `);
}
