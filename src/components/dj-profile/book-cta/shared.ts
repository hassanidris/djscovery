export const BUDGET_OPTIONS = [
  { value: "FIXED", label: "Fixed", hint: "Single guaranteed fee" },
  { value: "RANGE", label: "Range", hint: "Provide min & max" },
  { value: "NEGOTIABLE", label: "Negotiable", hint: "Open to offers" },
  { value: "TBA", label: "TBA", hint: "Decide closer to date" },
] as const;

export type BudgetChoice = (typeof BUDGET_OPTIONS)[number]["value"];

export type FormState = {
  eventName: string;
  eventDate: string;
  countryId: string;
  cityId: string;
  venue: string;
  crowdSize: string;
  budgetType: BudgetChoice;
  budgetMin: string;
  budgetMax: string;
  budgetCurrency: string;
  message: string;
  packageName?: string;
  packagePrice?: number;
  packagePriceTo?: number;
};

export const CUSTOM_VENUE_VALUE = "__CUSTOM__";
export const MIN_MESSAGE_LENGTH = 50;
