// Common country-code to primary timezone mapping.
// Uses ISO 3166-1 alpha-2 country codes.

export const COUNTRY_TIMEZONES: Record<string, string> = {
  SE: "Europe/Stockholm",
  NO: "Europe/Oslo",
  DK: "Europe/Copenhagen",
  FI: "Europe/Helsinki",
  DE: "Europe/Berlin",
  NL: "Europe/Amsterdam",
  BE: "Europe/Brussels",
  FR: "Europe/Paris",
  ES: "Europe/Madrid",
  IT: "Europe/Rome",
  PT: "Europe/Lisbon",
  CH: "Europe/Zurich",
  AT: "Europe/Vienna",
  PL: "Europe/Warsaw",
  CZ: "Europe/Prague",
  HU: "Europe/Budapest",
  RO: "Europe/Bucharest",
  BG: "Europe/Sofia",
  HR: "Europe/Zagreb",
  SI: "Europe/Ljubljana",
  SK: "Europe/Bratislava",
  LT: "Europe/Vilnius",
  LV: "Europe/Riga",
  EE: "Europe/Tallinn",
  IE: "Europe/Dublin",
  GB: "Europe/London",
  US: "America/New_York",
  CA: "America/Toronto",
  MX: "America/Mexico_City",
  BR: "America/Sao_Paulo",
  AR: "America/Argentina/Buenos_Aires",
  CL: "America/Santiago",
  CO: "America/Bogota",
  PE: "America/Lima",
  VE: "America/Caracas",
  AU: "Australia/Sydney",
  NZ: "Pacific/Auckland",
  JP: "Asia/Tokyo",
  KR: "Asia/Seoul",
  CN: "Asia/Shanghai",
  IN: "Asia/Kolkata",
  TH: "Asia/Bangkok",
  SG: "Asia/Singapore",
  MY: "Asia/Kuala_Lumpur",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  VN: "Asia/Ho_Chi_Minh",
  HK: "Asia/Hong_Kong",
  TW: "Asia/Taipei",
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  IL: "Asia/Jerusalem",
  TR: "Europe/Istanbul",
  RU: "Europe/Moscow",
  UA: "Europe/Kyiv",
  ZA: "Africa/Johannesburg",
  EG: "Africa/Cairo",
  NG: "Africa/Lagos",
  KE: "Africa/Nairobi",
  GH: "Africa/Accra",
  MA: "Africa/Casablanca",
  TN: "Africa/Tunis",
  GR: "Europe/Athens",
  IS: "Atlantic/Reykjavik",
};

export function getTimezoneByCountryCode(code: string): string | undefined {
  return COUNTRY_TIMEZONES[code.toUpperCase()];
}

export function getTimezoneOffsetLabel(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value;
    return offset ?? "";
  } catch {
    return "";
  }
}

export const VALID_TIMEZONES = new Set(Object.values(COUNTRY_TIMEZONES));

export function isValidTimezone(tz: string): boolean {
  return VALID_TIMEZONES.has(tz);
}
