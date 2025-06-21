
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
  annualPrices: {
    GBP: number;
    USD: number;
    GHS: number;
    NGN: number;
  };
  isFree?: boolean;
  policyLimit?: string;
  bestFor?: string;
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
    isFree: true,
    policyLimit: '3 policies',
    bestFor: 'New/personal users',
    features: [
      'Store up to 3 policies',
      'Basic AI analysis',
      'Email notifications',
      'Mobile app access'
    ],
    prices: {
      GBP: 0,
      USD: 0,
      GHS: 0,
      NGN: 0
    },
    annualPrices: {
      GBP: 0,
      USD: 0,
      GHS: 0,
      NGN: 0
    }
  },
  {
    id: 'pro',
    name: 'Padlock Pro',
    description: 'Advanced features for power users',
    policyLimit: 'Unlimited',
    bestFor: 'Families/power users',
    features: [
      'Unlimited policies',
      'Advanced AI analysis',
      'Priority support',
      'Claims assistance',
      'Smart notifications',
      'Document vault'
    ],
    prices: {
      GBP: 3.99,
      USD: 4.99,
      GHS: 32.99,
      NGN: 1999.99
    },
    annualPrices: {
      GBP: 39.99,
      USD: 49.99,
      GHS: 329.99,
      NGN: 19999.99
    }
  },
  {
    id: 'premium',
    name: 'Padlock Premium',
    description: 'Complete insurance management solution',
    policyLimit: 'Unlimited',
    bestFor: 'VIPs, business, advisors',
    features: [
      'Everything in Pro',
      'Personal insurance advisor',
      'Custom policy recommendations',
      'Insurance comparison tools',
      'White-glove support',
      'VIP priority support'
    ],
    prices: {
      GBP: 9.99,
      USD: 12.99,
      GHS: 79.99,
      NGN: 4999.99
    },
    annualPrices: {
      GBP: 99.99,
      USD: 129.99,
      GHS: 799.99,
      NGN: 49999.99
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
  if (amount === 0) return 'Free';
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
