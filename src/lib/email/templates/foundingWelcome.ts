import { baseLayout, escapeHtml } from "./base";

export const foundingWelcomeSubject = "Welcome to the founding DJ family! 🎧";

export function foundingWelcomeHtml({
  name,
  foundingNumber,
}: {
  name: string;
  foundingNumber: number;
}): string {
  const displayName = escapeHtml(name);
  return baseLayout(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">
      Welcome, Founding DJ #${foundingNumber}! 🎧
    </h1>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Your profile is now live and you're officially part of the DJcovery founding member family.
      As founding member #${foundingNumber}, you'll enjoy exclusive benefits and priority access
      to new features as we grow.
    </p>
    <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Start by completing your profile, adding your media, and exploring the platform. Organizers
      can now discover you and book you for gigs.
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
