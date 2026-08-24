// Country → default currency code mapping.
// Used by DJ profile forms to auto-set fee currency when a country is selected.
export const COUNTRY_CURRENCIES: Record<string, string> = {
  Sweden: "SEK",
  "United Kingdom": "GBP",
  "United States": "USD",
  Germany: "EUR",
  France: "EUR",
  Spain: "EUR",
  Italy: "EUR",
  Netherlands: "EUR",
  Belgium: "EUR",
  Portugal: "EUR",
  Austria: "EUR",
  Switzerland: "CHF",
  Norway: "NOK",
  Denmark: "DKK",
  Finland: "EUR",
  Poland: "PLN",
  "Czech Republic": "CZK",
  Hungary: "HUF",
  Romania: "RON",
  Turkey: "TRY",
  Russia: "RUB",
  Ukraine: "UAH",
  Australia: "AUD",
  "New Zealand": "NZD",
  Canada: "CAD",
  Mexico: "MXN",
  Brazil: "BRL",
  Argentina: "ARS",
  Colombia: "COP",
  Chile: "CLP",
  "South Africa": "ZAR",
  Nigeria: "NGN",
  Kenya: "KES",
  Ghana: "GHS",
  Egypt: "EGP",
  Morocco: "MAD",
  "Saudi Arabia": "SAR",
  "United Arab Emirates": "AED",
  Qatar: "QAR",
  Kuwait: "KWD",
  Bahrain: "BHD",
  Israel: "ILS",
  India: "INR",
  Pakistan: "PKR",
  Bangladesh: "BDT",
  Japan: "JPY",
  China: "CNY",
  "South Korea": "KRW",
  Singapore: "SGD",
  Malaysia: "MYR",
  Indonesia: "IDR",
  Thailand: "THB",
  Philippines: "PHP",
  Vietnam: "VND",
  Lebanon: "LBP",
  Jordan: "JOD",
  Iraq: "IQD",
  Somalia: "SOS",
};

/**
 * Resolve a currency code for a country name.
 * Falls back to "USD" when the country is not mapped or the mapped
 * currency is not in the provided set of available codes.
 */
export function resolveCurrencyForCountry(
  countryName: string,
  availableCodes?: Set<string>,
): string {
  const mapped = COUNTRY_CURRENCIES[countryName];
  if (!mapped) return "USD";
  if (availableCodes && !availableCodes.has(mapped)) return "USD";
  return mapped;
}
