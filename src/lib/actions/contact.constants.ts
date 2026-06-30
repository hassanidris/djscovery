import type { ContactCategory as ContactCategoryEnum } from "@prisma/client";

export const CONTACT_CATEGORIES = [
  "General enquiry",
  "Support",
  "Report a problem",
  "Business & partnerships",
  "Press & media",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export const CONTACT_CATEGORY_TO_ENUM: Record<
  ContactCategory,
  ContactCategoryEnum
> = {
  "General enquiry": "GENERAL_ENQUIRY",
  Support: "SUPPORT",
  "Report a problem": "REPORT_A_PROBLEM",
  "Business & partnerships": "BUSINESS_PARTNERSHIPS",
  "Press & media": "PRESS_MEDIA",
};

export const ENUM_TO_CONTACT_CATEGORY: Record<
  ContactCategoryEnum,
  ContactCategory
> = {
  GENERAL_ENQUIRY: "General enquiry",
  SUPPORT: "Support",
  REPORT_A_PROBLEM: "Report a problem",
  BUSINESS_PARTNERSHIPS: "Business & partnerships",
  PRESS_MEDIA: "Press & media",
};

export type ContactFormState = {
  success: boolean;
  errors?: Partial<Record<string, string>>;
  message?: string;
};
