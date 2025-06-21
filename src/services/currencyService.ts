
// Currency mapping based on country codes
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
};

// Default currency (GBP)
const DEFAULT_CURRENCY = { code: 'GBP', symbol: '£', name: 'British Pound' };

export const getCurrencyByCountry = (countryCode?: string | null) => {
  if (!countryCode) return DEFAULT_CURRENCY;
  return CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
};

export const formatCurrency = (amount: number, countryCode?: string | null) => {
  const currency = getCurrencyByCountry(countryCode);
  
  // Format the number with appropriate decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Return formatted string with currency symbol
  return `${currency.symbol}${formattedAmount}`;
};

// For future implementation of currency conversion
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  // Placeholder for future currency conversion API integration
  // For now, return the original amount
  console.log(`Currency conversion from ${fromCurrency} to ${toCurrency} not yet implemented`);
  return amount;
};

export const getAllSupportedCurrencies = () => {
  return Object.entries(CURRENCY_MAP).map(([countryCode, currency]) => ({
    countryCode,
    ...currency,
  }));
};
