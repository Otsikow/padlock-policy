export type PolicyType = 'health' | 'auto' | 'life' | 'home' | 'other';

export interface MarketplaceProduct {
  id: string;
  product_name: string;
  insurer_name: string;
  policy_type: PolicyType;
  monthly_premium: number;
  annual_premium?: number;
  coverage_amount: number;
  coverage_summary?: string;
  region: string;
  min_age?: number;
  max_age?: number;
  extra_benefits?: string[];
  company_rating: number;
  instant_issue: boolean;
  requires_medical_exam: boolean;
  covers_pre_existing_conditions: boolean;
  covers_high_risk_jobs: boolean;
  description?: string;
  terms_url?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MarketplaceFilters {
  policy_type?: PolicyType;
  min_premium?: number;
  max_premium?: number;
  min_coverage?: number;
  max_coverage?: number;
  region?: string;
  age?: number;
  min_rating?: number;
  instant_issue_only?: boolean;
  covers_pre_existing?: boolean;
  covers_high_risk_jobs?: boolean;
  extra_benefits?: string[];
}

export interface AISearchQuery {
  query: string;
  parsedFilters?: MarketplaceFilters;
  suggestions?: string[];
}

export const POLICY_TYPES: { value: PolicyType; label: string }[] = [
  { value: 'health', label: 'Health Insurance' },
  { value: 'auto', label: 'Car Insurance' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'home', label: 'Home Insurance' },
  { value: 'other', label: 'Other Insurance' },
];

export const UK_REGIONS = [
  'UK-wide',
  'London',
  'Manchester',
  'Birmingham',
  'Leeds',
  'Glasgow',
  'Edinburgh',
  'Liverpool',
  'Bristol',
  'Newcastle',
  'Sheffield',
  'Cardiff',
  'Belfast',
  'South East',
  'South West',
  'East Midlands',
  'West Midlands',
  'North West',
  'North East',
  'Yorkshire',
  'Scotland',
  'Wales',
  'Northern Ireland',
];

export const COMMON_BENEFITS = [
  '24/7 Support',
  'No Excess',
  'Breakdown Cover',
  'Legal Cover',
  'Personal Accident Cover',
  'European Cover',
  'Courtesy Car',
  'Windscreen Cover',
  'Key Cover',
  'Home Emergency',
  'Dental Cover',
  'Optical Cover',
  'Mental Health Support',
  'Physiotherapy',
  'Travel Insurance',
  'Critical Illness',
  'Income Protection',
];
