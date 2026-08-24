// Social / music platform options shared across DJ profile forms.
export const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "mixcloud", label: "Mixcloud" },
  { value: "apple", label: "Apple Music" },
  { value: "anghami", label: "Anghami" },
  { value: "website", label: "Website" },
] as const;

export type SocialPlatformValue = (typeof SOCIAL_PLATFORMS)[number]["value"];

export const SOCIAL_PLATFORM_VALUES = SOCIAL_PLATFORMS.map(
  (p) => p.value,
) as readonly SocialPlatformValue[];
