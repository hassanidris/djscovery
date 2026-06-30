export const CONTACT_CATEGORIES = [
  "General enquiry",
  "Support",
  "Report a problem",
  "Business & partnerships",
  "Press & media",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export type ContactFormState = {
  success: boolean;
  errors?: Partial<Record<string, string>>;
  message?: string;
};
