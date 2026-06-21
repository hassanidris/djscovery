import { baseLayout } from "./base";

export const welcomeEmailSubject = "Welcome to DJcovery 🎵";

export function welcomeEmailHtml({ name }: { name: string }): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://djcovery.com";
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      Welcome, ${displayName}! 🎉
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      You're now part of DJcovery — the platform connecting DJs, organizers, and music fans.
      Here's what you can do:
    </p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
          <span style="color:#e11d48;font-size:16px;margin-right:10px;">🎛️</span>
          <span style="color:#d1d5db;font-size:14px;">DJs — create a profile and get discovered by organizers</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
          <span style="color:#e11d48;font-size:16px;margin-right:10px;">🎪</span>
          <span style="color:#d1d5db;font-size:14px;">Organizers — post gigs and find the perfect DJ</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <span style="color:#e11d48;font-size:16px;margin-right:10px;">🎧</span>
          <span style="color:#d1d5db;font-size:14px;">Fans — discover DJs, follow artists &amp; explore events</span>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${baseUrl}"
             style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Explore DJcovery →
          </a>
        </td>
      </tr>
    </table>
  `);
}
