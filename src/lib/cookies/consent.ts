export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  updatedAt: string;
}

export type ConsentCategory = keyof Omit<CookieConsent, "updatedAt">;

export const CONSENT_COOKIE_NAME = "djcovery-consent";
export const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export const CONSENT_CATEGORIES: {
  key: ConsentCategory;
  label: string;
  description: string;
  required: boolean;
}[] = [
  {
    key: "necessary",
    label: "Strictly Necessary",
    description:
      "Required for the site to function. Includes authentication, security, and session cookies. Cannot be disabled.",
    required: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    description:
      "Help us understand how visitors use the site so we can improve performance and content.",
    required: false,
  },
  {
    key: "marketing",
    label: "Marketing",
    description:
      "Used to deliver relevant ads and track campaigns across websites.",
    required: false,
  },
  {
    key: "preferences",
    label: "Preferences",
    description:
      "Remember your settings and personalise your experience (e.g. language, region).",
    required: false,
  },
];

export function getStoredConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

export function saveConsent(consent: Omit<CookieConsent, "updatedAt">): void {
  const value: CookieConsent = {
    ...consent,
    updatedAt: new Date().toISOString(),
  };
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function acceptAll(): void {
  saveConsent({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });
}

export function rejectNonEssential(): void {
  saveConsent({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
}
