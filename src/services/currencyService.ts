
// Enhanced currency mapping with more countries and currencies
const CURRENCY_MAP: Record<string, { code: string; symbol: string; name: string }> = {
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  GH: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  TZ: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  UG: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  RW: { code: 'RWF', symbol: 'RWF', name: 'Rwandan Franc' },
  ET: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  EG: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  MA: { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
  NL: { code: 'EUR', symbol: '€', name: 'Euro' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  HK: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
};

// Default currency (GBP)
const DEFAULT_CURRENCY = { code: 'GBP', symbol: '£', name: 'British Pound' };

export const getCurrencyByCountry = (countryCode?: string | null) => {
  if (!countryCode) return DEFAULT_CURRENCY;
  return CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
};

export const formatCurrency = (amount: number, countryCode?: string | null) => {
  const currency = getCurrencyByCountry(countryCode);
  
  // Ensure consistent formatting - no mixing of symbols
  const formattedAmount = Number(amount).toFixed(2);
  
  // Return ONLY the user's preferred currency symbol and amount
  return `${currency.symbol}${formattedAmount}`;
};

export const getAllSupportedCurrencies = () => {
  return Object.entries(CURRENCY_MAP).map(([countryCode, currency]) => ({
    countryCode,
    ...currency,
  }));
};

// Get Stripe-supported currencies for actual billing
export const getStripeSupportedCurrencies = () => {
  return ['GBP', 'USD', 'EUR', 'CAD', 'AUD', 'SGD', 'HKD', 'JPY'];
};

export const isStripeCurrencySupported = (currency: string): boolean => {
  return getStripeSupportedCurrencies().includes(currency);
};
