
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
  
  // Format the number with appropriate decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Return formatted string with currency symbol
  return `${currency.symbol}${formattedAmount}`;
};

// Live currency conversion using exchange rates API
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<{ convertedAmount: number; rate: number; approximation?: boolean }> => {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, rate: 1 };
  }

  try {
    // Use a free exchange rate API
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const data = await response.json();
    
    if (data.rates && data.rates[toCurrency]) {
      const rate = data.rates[toCurrency];
      const convertedAmount = amount * rate;
      return { convertedAmount, rate };
    }
    
    // If API fails, use fallback static rates (mark as approximation)
    return getFallbackConversion(amount, fromCurrency, toCurrency);
  } catch (error) {
    console.warn('Live currency conversion failed, using fallback rates:', error);
    return getFallbackConversion(amount, fromCurrency, toCurrency);
  }
};

const getFallbackConversion = (amount: number, fromCurrency: string, toCurrency: string) => {
  // Static fallback rates (approximate)
  const fallbackRates: { [key: string]: { [key: string]: number } } = {
    GBP: {
      USD: 1.26, CAD: 1.71, EUR: 1.20, AUD: 1.91, GHS: 15.8, NGN: 1950,
      INR: 105, KES: 162, TZS: 3100, UGX: 4650, ZAR: 22.5, JPY: 188, SGD: 1.69
    },
    USD: {
      GBP: 0.79, CAD: 1.36, EUR: 0.95, AUD: 1.52, GHS: 12.5, NGN: 1550,
      INR: 83, KES: 128, TZS: 2450, UGX: 3680, ZAR: 17.8, JPY: 149, SGD: 1.34
    },
    EUR: {
      GBP: 0.83, USD: 1.05, CAD: 1.43, AUD: 1.60, GHS: 13.2, NGN: 1630,
      INR: 87, KES: 135, TZS: 2580, UGX: 3870, ZAR: 18.7, JPY: 157, SGD: 1.41
    }
  };

  if (fallbackRates[fromCurrency] && fallbackRates[fromCurrency][toCurrency]) {
    const rate = fallbackRates[fromCurrency][toCurrency];
    return { 
      convertedAmount: amount * rate, 
      rate, 
      approximation: true 
    };
  }

  // If no conversion available, return original amount
  return { convertedAmount: amount, rate: 1, approximation: true };
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

// For display purposes, show conversion if not Stripe-supported
export const getCurrencyDisplayInfo = async (
  baseAmount: number, 
  baseCurrency: string, 
  userCurrency: string
) => {
  if (baseCurrency === userCurrency) {
    return {
      displayAmount: baseAmount,
      displayCurrency: userCurrency,
      isExact: true,
      conversionText: null
    };
  }

  if (isStripeCurrencySupported(userCurrency)) {
    // Can bill in user's currency
    const conversion = await convertCurrency(baseAmount, baseCurrency, userCurrency);
    return {
      displayAmount: conversion.convertedAmount,
      displayCurrency: userCurrency,
      isExact: !conversion.approximation,
      conversionText: null
    };
  } else {
    // Show approximation alongside base currency
    const conversion = await convertCurrency(baseAmount, baseCurrency, userCurrency);
    const userSymbol = getCurrencyByCountry()?.symbol || '';
    const baseSymbol = getCurrencyByCountry()?.symbol || '';
    
    return {
      displayAmount: baseAmount,
      displayCurrency: baseCurrency,
      isExact: true,
      conversionText: `≈ ${userSymbol}${conversion.convertedAmount.toFixed(2)} ${userCurrency}`
    };
  }
};
