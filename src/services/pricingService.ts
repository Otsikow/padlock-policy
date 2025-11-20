
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  prices: {
    GBP: number;
    USD: number;
    CAD: number;
    AUD: number;
    EUR: number;
  };
  annualPrices: {
    GBP: number;
    USD: number;
    CAD: number;
    AUD: number;
    EUR: number;
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
    CAD: number;
    AUD: number;
    EUR: number;
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
      CAD: 0,
      AUD: 0,
      EUR: 0
    },
    annualPrices: {
      GBP: 0,
      USD: 0,
      CAD: 0,
      AUD: 0,
      EUR: 0
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
      CAD: 6.79,
      AUD: 7.59,
      EUR: 4.59
    },
    annualPrices: {
      GBP: 39.99,
      USD: 49.99,
      CAD: 67.99,
      AUD: 75.99,
      EUR: 45.99
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
      CAD: 16.99,
      AUD: 18.99,
      EUR: 11.49
    },
    annualPrices: {
      GBP: 99.99,
      USD: 129.99,
      CAD: 169.99,
      AUD: 189.99,
      EUR: 114.99
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
      CAD: 54.99,
      AUD: 59.99,
      EUR: 34.99
    }
  },
  {
    id: 'expert-advice',
    name: 'Expert Advice',
    description: 'One-on-one consultation with insurance expert',
    prices: {
      GBP: 49.99,
      USD: 64.99,
      CAD: 89.99,
      AUD: 99.99,
      EUR: 57.99
    }
  },
  {
    id: 'policy-review',
    name: 'Policy Review',
    description: 'Comprehensive review of your current policies',
    prices: {
      GBP: 19.99,
      USD: 24.99,
      CAD: 34.99,
      AUD: 37.99,
      EUR: 22.99
    }
  }
];

export const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    GBP: '£',
    USD: '$',
    CAD: 'CAD',
    AUD: 'AUD',
    EUR: '€'
  };
  return symbols[currency] || currency;
};

export const formatPrice = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  if (amount === 0) return 'Free';
  return `${symbol}${amount.toFixed(2)}`;
};

// All supported currencies are Stripe-supported
export const getStripeCurrency = (currency: string): string => {
  const supportedCurrencies = ['GBP', 'USD', 'CAD', 'AUD', 'EUR'];
  if (supportedCurrencies.includes(currency)) {
    return currency;
  }
  // Fallback to GBP if currency not supported
  return 'GBP';
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
