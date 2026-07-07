export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  // Major Currencies
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "$", name: "Hong Kong Dollar" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  { code: "NZD", symbol: "$", name: "New Zealand Dollar" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "COP", symbol: "$", name: "Colombian Peso" },
  { code: "CLP", symbol: "$", name: "Chilean Peso" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
  { code: "ARS", symbol: "$", name: "Argentine Peso" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },

  // Middle East / GCC
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound" },
  { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar" },
  { code: "SYP", symbol: "£", name: "Syrian Pound" },
  { code: "YER", symbol: "﷼", name: "Yemeni Rial" },

  // Asia Pacific
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel" },
  { code: "LAK", symbol: "₭", name: "Lao Kip" },
  { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa" },
  { code: "PGK", symbol: "K", name: "Papua New Guinean Kina" },
  { code: "FJD", symbol: "$", name: "Fiji Dollar" },
  { code: "SBD", symbol: "$", name: "Solomon Islands Dollar" },
  { code: "VUV", symbol: "Vt", name: "Vanuatu Vatu" },
  { code: "WST", symbol: "T", name: "Samoan Tala" },
  { code: "TOP", symbol: "T$", name: "Tongan Pa'anga" },

  // Europe
  { code: "ISK", symbol: "kr", name: "Icelandic Króna" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna" },
  { code: "RSD", symbol: "дин", name: "Serbian Dinar" },
  { code: "BAM", symbol: "КМ", name: "Bosnia-Herzegovina Convertible Mark" },
  { code: "MKD", symbol: "ден", name: "Macedonian Denar" },
  { code: "ALL", symbol: "L", name: "Albanian Lek" },
  { code: "MDL", symbol: "L", name: "Moldovan Leu" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
  { code: "BYN", symbol: "Br", name: "Belarusian Ruble" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari" },
  { code: "AMD", symbol: "֏", name: "Armenian Dram" },
  { code: "AZN", symbol: "₼", name: "Azerbaijani Manat" },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge" },
  { code: "KGS", symbol: "с", name: "Kyrgystani Som" },
  { code: "UZS", symbol: "so'm", name: "Uzbekistan Som" },
  { code: "TJS", symbol: "ЅМ", name: "Tajikistani Somoni" },
  { code: "MNT", symbol: "₮", name: "Mongolian Tugrik" },

  // Africa
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "RWF", symbol: "RF", name: "Rwandan Franc" },
  { code: "BIF", symbol: "FBu", name: "Burundian Franc" },
  { code: "CDF", symbol: "FC", name: "Congolese Franc" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
  { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc" },
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza" },
  { code: "MZN", symbol: "MT", name: "Mozambican Metical" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha" },
  { code: "BWP", symbol: "P", name: "Botswanan Pula" },
  { code: "NAD", symbol: "$", name: "Namibian Dollar" },
  { code: "SZL", symbol: "L", name: "Swazi Lilangeni" },
  { code: "LSL", symbol: "L", name: "Lesotho Loti" },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
  { code: "SOS", symbol: "S", name: "Somali Shilling" },
  { code: "DJF", symbol: "Fdj", name: "Djiboutian Franc" },
  { code: "ERN", symbol: "Nfk", name: "Eritrean Nakfa" },
  { code: "SDG", symbol: "ج.س.", name: "Sudanese Pound" },
  { code: "LYD", symbol: "ل.د", name: "Libyan Dinar" },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar" },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  { code: "MRU", symbol: "UM", name: "Mauritanian Ouguiya" },

  // Americas
  { code: "BOB", symbol: "Bs", name: "Bolivian Boliviano" },
  { code: "PYG", symbol: "₲", name: "Paraguayan Guarani" },
  { code: "UYU", symbol: "$", name: "Uruguayan Peso" },
  { code: "GYD", symbol: "$", name: "Guyanaese Dollar" },
  { code: "SRD", symbol: "$", name: "Surinamese Dollar" },
  { code: "XCD", symbol: "$", name: "East Caribbean Dollar" },
  { code: "BBD", symbol: "$", name: "Barbadian Dollar" },
  { code: "BSD", symbol: "$", name: "Bahamian Dollar" },
  { code: "BZD", symbol: "$", name: "Belize Dollar" },
  { code: "JMD", symbol: "$", name: "Jamaican Dollar" },
  { code: "HTG", symbol: "G", name: "Haitian Gourde" },
  { code: "DOP", symbol: "$", name: "Dominican Peso" },
  { code: "CUP", symbol: "$", name: "Cuban Peso" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón" },
  { code: "NIO", symbol: "C$", name: "Nicaraguan Córdoba" },
  { code: "HNL", symbol: "L", name: "Honduran Lempira" },
  { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal" },
  { code: "SVC", symbol: "$", name: "Salvadoran Colón" },
  { code: "PAB", symbol: "B/.", name: "Panamanian Balboa" },
  { code: "VES", symbol: "Bs", name: "Venezuelan Bolívar" },

  // Oceania
  { code: "XPF", symbol: "₣", name: "CFP Franc" },

  // Caribbean
  { code: "TTD", symbol: "$", name: "Trinidad and Tobago Dollar" },
  { code: "AWG", symbol: "ƒ", name: "Aruban Florin" },
  { code: "ANG", symbol: "ƒ", name: "Netherlands Antillean Guilder" },

  // Central Asia
  { code: "AFN", symbol: "؋", name: "Afghan Afghani" },

  // South Asia
  { code: "BTN", symbol: "Nu.", name: "Bhutanese Ngultrum" },

  // Southeast Asia
  { code: "BND", symbol: "$", name: "Brunei Dollar" },

  // East Asia
  { code: "MOP", symbol: "MOP$", name: "Macanese Pataca" },
  { code: "KPW", symbol: "₩", name: "North Korean Won" },
];

export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  const symbol = currency?.symbol || currencyCode;
  return `${symbol}${amount.toLocaleString()}`;
}
