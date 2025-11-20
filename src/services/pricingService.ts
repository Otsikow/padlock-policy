
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
  supportLevel?: string;
  upgradePrompts?: string[];
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
    supportLevel: 'Email only',
    upgradePrompts: [
      'You\'ve reached your policy limit. Upgrade to Pro for unlimited policies.',
      'Get advanced AI analysis with Pro - from just $4.99/month.',
      'Need faster support? Upgrade to Pro for priority assistance.'
    ],
    features: [
      'Store up to 3 policies',
      'Basic AI analysis',
      'Email notifications',
      'Mobile app access',
      'Email-only support'
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
    supportLevel: 'Priority support (<24h response)',
    features: [
      'Everything in Basic',
      'Unlimited policies',
      'Advanced AI analysis with deeper insights',
      'Claims assistance',
      'Priority support (chat/email, <24h response)',
      'Document vault',
      'Smart notifications'
    ],
    prices: {
      GBP: 3.99,
      USD: 4.99,
      GHS: 57.02,
      NGN: 1999.99
    },
    annualPrices: {
      GBP: 39.99,
      USD: 49.99,
      GHS: 570.20,
      NGN: 19999.99
    }
  },
  {
    id: 'premium',
    name: 'Padlock Premium',
    description: 'Complete insurance management solution',
    policyLimit: 'Unlimited',
    bestFor: 'VIPs, business, advisors',
    supportLevel: 'White-glove support (live chat/phone)',
    features: [
      'Everything in Pro',
      'Dedicated insurance advisor',
      'Custom policy recommendations',
      'Insurance comparison tools',
      'White-glove support (live chat/phone)',
      'Onboarding assistance',
      'Early access to new features'
    ],
    prices: {
      GBP: 9.99,
      USD: 12.99,
      GHS: 142.86,
      NGN: 4999.99
    },
    annualPrices: {
      GBP: 99.99,
      USD: 129.99,
      GHS: 1428.60,
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

// New function to check if user has access to a feature
export const hasFeatureAccess = (userPlan: string, feature: string): boolean => {
  const planHierarchy = ['basic', 'pro', 'premium'];
  const userPlanIndex = planHierarchy.indexOf(userPlan?.toLowerCase() || 'basic');
  
  const featureAccess: { [key: string]: number } = {
    'unlimited_policies': 1, // Pro and above
    'advanced_ai': 1, // Pro and above
    'claims_assistance': 1, // Pro and above
    'priority_support': 1, // Pro and above
    'document_vault': 1, // Pro and above
    'dedicated_advisor': 2, // Premium only
    'comparison_tools': 2, // Premium only
    'white_glove_support': 2, // Premium only
    'early_access': 2, // Premium only
  };
  
  return userPlanIndex >= (featureAccess[feature] || 0);
};

// Function to get upgrade prompts for current user
export const getUpgradePrompt = (userPlan: string, feature: string): string => {
  const plan = subscriptionPlans.find(p => p.id === userPlan?.toLowerCase());
  if (!plan?.upgradePrompts) return 'Upgrade to access this feature';
  
  const prompts: { [key: string]: string } = {
    'policy_limit': plan.upgradePrompts[0] || 'Upgrade for unlimited policies',
    'advanced_ai': plan.upgradePrompts[1] || 'Upgrade for advanced AI analysis',
    'support': plan.upgradePrompts[2] || 'Upgrade for priority support'
  };
  
  return prompts[feature] || 'Upgrade to access premium features';
};

// Function to calculate annual savings
export const getAnnualSavings = (plan: PricingPlan, currency: string): number => {
  const monthlyPrice = plan.prices[currency as keyof typeof plan.prices];
  const annualPrice = plan.annualPrices[currency as keyof typeof plan.annualPrices];
  const monthlyTotal = monthlyPrice * 12;
  return monthlyTotal - annualPrice;
};

// Function to get savings percentage
export const getSavingsPercentage = (plan: PricingPlan, currency: string): number => {
  const savings = getAnnualSavings(plan, currency);
  const monthlyTotal = plan.prices[currency as keyof typeof plan.prices] * 12;
  return Math.round((savings / monthlyTotal) * 100);
};
