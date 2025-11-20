
// Simplified currency mapping - 5 supported currencies
const CURRENCY_MAP: Record<string, { code: string; symbol: string; name: string }> = {
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  CA: { code: 'CAD', symbol: 'CAD', name: 'Canadian Dollar' },
  AU: { code: 'AUD', symbol: 'AUD', name: 'Australian Dollar' },
  // Eurozone countries
  AT: { code: 'EUR', symbol: '€', name: 'Euro' },
  BE: { code: 'EUR', symbol: '€', name: 'Euro' },
  CY: { code: 'EUR', symbol: '€', name: 'Euro' },
  EE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FI: { code: 'EUR', symbol: '€', name: 'Euro' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  GR: { code: 'EUR', symbol: '€', name: 'Euro' },
  IE: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  LV: { code: 'EUR', symbol: '€', name: 'Euro' },
  LT: { code: 'EUR', symbol: '€', name: 'Euro' },
  LU: { code: 'EUR', symbol: '€', name: 'Euro' },
  MT: { code: 'EUR', symbol: '€', name: 'Euro' },
  NL: { code: 'EUR', symbol: '€', name: 'Euro' },
  PT: { code: 'EUR', symbol: '€', name: 'Euro' },
  SK: { code: 'EUR', symbol: '€', name: 'Euro' },
  SI: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
};

// Default currency (GBP)
const DEFAULT_CURRENCY = { code: 'GBP', symbol: '£', name: 'British Pound' };

export const getCurrencyByCountry = (countryCode?: string | null) => {
  if (!countryCode) return DEFAULT_CURRENCY;
  return CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
};

export const formatCurrency = (amount: number, countryCode?: string | null) => {
  const currency = getCurrencyByCountry(countryCode);
  const formattedAmount = Number(amount).toFixed(2);
  
  // Handle spacing for multi-character symbols
  const needsSpace = currency.symbol.length > 1 && !currency.symbol.startsWith('$');
  return `${currency.symbol}${needsSpace ? ' ' : ''}${formattedAmount}`;
};

export const getAllSupportedCurrencies = () => {
  // Get unique currencies (avoid duplicates from Eurozone countries)
  const uniqueCurrencies = new Map();
  Object.entries(CURRENCY_MAP).forEach(([countryCode, currency]) => {
    if (!uniqueCurrencies.has(currency.code)) {
      uniqueCurrencies.set(currency.code, {
        countryCode,
        ...currency,
      });
    }
  });
  return Array.from(uniqueCurrencies.values());
};

// Get Stripe-supported currencies for actual billing (all 5 are Stripe-supported)
export const getStripeSupportedCurrencies = () => {
  return ['GBP', 'USD', 'EUR', 'CAD', 'AUD'];
};

export const isStripeCurrencySupported = (currency: string): boolean => {
  return getStripeSupportedCurrencies().includes(currency);
};
