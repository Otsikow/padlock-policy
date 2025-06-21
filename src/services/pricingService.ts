
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  prices: {
    GBP: number;
    USD: number;
    GHS: number;
    NGN: number;
  };
}

export interface OneTimeService {
  id: string;
  name: string;
  description: string;
  prices: {
    GBP: number;
    USD: number;
    GHS: number;
    NGN: number;
  };
}

export const subscriptionPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Padlock Basic',
    description: 'Essential features for managing your insurance',
    features: [
      'Store up to 5 policies',
      'Basic AI analysis',
      'Email notifications',
      'Mobile app access'
    ],
    prices: {
      GBP: 4.99,
      USD: 6.99,
      GHS: 45.99,
      NGN: 2999.99
    }
  },
  {
    id: 'pro',
    name: 'Padlock Pro',
    description: 'Advanced features for power users',
    features: [
      'Unlimited policies',
      'Advanced AI analysis',
      'Priority support',
      'Claims assistance',
      'Smart notifications',
      'Document vault'
    ],
    prices: {
      GBP: 9.99,
      USD: 12.99,
      GHS: 89.99,
      NGN: 5999.99
    }
  },
  {
    id: 'premium',
    name: 'Padlock Premium',
    description: 'Complete insurance management solution',
    features: [
      'Everything in Pro',
      'Personal insurance advisor',
      'Custom policy recommendations',
      'Insurance comparison tools',
      'White-glove support'
    ],
    prices: {
      GBP: 19.99,
      USD: 24.99,
      GHS: 179.99,
      NGN: 11999.99
    }
  }
];

export const oneTimeServices: OneTimeService[] = [
  {
    id: 'switch-assistant',
    name: 'Switch Assistant',
    description: 'Get help switching to a better insurance policy',
    prices: {
      GBP: 29.99,
      USD: 39.99,
      GHS: 249.99,
      NGN: 14999.99
    }
  },
  {
    id: 'expert-advice',
    name: 'Expert Advice',
    description: 'One-on-one consultation with insurance expert',
    prices: {
      GBP: 49.99,
      USD: 64.99,
      GHS: 399.99,
      NGN: 24999.99
    }
  },
  {
    id: 'policy-review',
    name: 'Policy Review',
    description: 'Comprehensive review of your current policies',
    prices: {
      GBP: 19.99,
      USD: 24.99,
      GHS: 159.99,
      NGN: 9999.99
    }
  }
];

export const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    GBP: '£',
    USD: '$',
    GHS: '₵',
    NGN: '₦'
  };
  return symbols[currency] || currency;
};

export const formatPrice = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};

// Fallback currencies for countries where Stripe doesn't support local currency
export const getStripeCurrency = (currency: string): string => {
  const supportedCurrencies = ['GBP', 'USD'];
  if (supportedCurrencies.includes(currency)) {
    return currency;
  }
  // For GHS and NGN, fallback to USD for Stripe processing
  return 'USD';
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // Simple conversion rates - in production, you'd use a real currency API
  const rates: { [key: string]: { [key: string]: number } } = {
    GHS: { USD: 0.062, GBP: 0.051 },
    NGN: { USD: 0.0012, GBP: 0.00099 }
  };
  
  if (fromCurrency === toCurrency) return amount;
  
  if (rates[fromCurrency] && rates[fromCurrency][toCurrency]) {
    return amount * rates[fromCurrency][toCurrency];
  }
  
  return amount; // No conversion available
};
