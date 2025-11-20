-- Create marketplace_products table for the public marketplace
CREATE TABLE public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic product information
  product_name TEXT NOT NULL,
  insurer_name TEXT NOT NULL,
  policy_type policy_type_enum NOT NULL,

  -- Pricing
  monthly_premium DECIMAL(10,2) NOT NULL,
  annual_premium DECIMAL(10,2),

  -- Coverage
  coverage_amount DECIMAL(12,2) NOT NULL,
  coverage_summary TEXT,

  -- Location and demographics
  region TEXT NOT NULL, -- e.g., 'London', 'Manchester', 'UK-wide'
  min_age INTEGER,
  max_age INTEGER,

  -- Product features
  extra_benefits TEXT[], -- Array of extra benefits
  company_rating DECIMAL(3,2) CHECK (company_rating >= 0 AND company_rating <= 5),
  instant_issue BOOLEAN DEFAULT false, -- true for instant issue, false for underwriting required

  -- Requirements
  requires_medical_exam BOOLEAN DEFAULT false,
  covers_pre_existing_conditions BOOLEAN DEFAULT false,
  covers_high_risk_jobs BOOLEAN DEFAULT false,

  -- Additional details
  description TEXT,
  terms_url TEXT,
  contact_info JSONB,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for common search patterns
CREATE INDEX idx_marketplace_products_policy_type ON public.marketplace_products(policy_type);
CREATE INDEX idx_marketplace_products_region ON public.marketplace_products(region);
CREATE INDEX idx_marketplace_products_monthly_premium ON public.marketplace_products(monthly_premium);
CREATE INDEX idx_marketplace_products_company_rating ON public.marketplace_products(company_rating);
CREATE INDEX idx_marketplace_products_instant_issue ON public.marketplace_products(instant_issue);
CREATE INDEX idx_marketplace_products_is_active ON public.marketplace_products(is_active);

-- Composite index for age range searches
CREATE INDEX idx_marketplace_products_age_range ON public.marketplace_products(min_age, max_age);

-- Enable Row Level Security
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view active marketplace products
CREATE POLICY "Anyone can view active marketplace products"
  ON public.marketplace_products
  FOR SELECT
  USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_marketplace_products_updated_at
  BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to search marketplace products with filters
CREATE OR REPLACE FUNCTION search_marketplace_products(
  p_policy_type policy_type_enum DEFAULT NULL,
  p_min_premium DECIMAL DEFAULT NULL,
  p_max_premium DECIMAL DEFAULT NULL,
  p_min_coverage DECIMAL DEFAULT NULL,
  p_max_coverage DECIMAL DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_age INTEGER DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT NULL,
  p_instant_issue_only BOOLEAN DEFAULT NULL,
  p_covers_pre_existing BOOLEAN DEFAULT NULL,
  p_covers_high_risk_jobs BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  product_name TEXT,
  insurer_name TEXT,
  policy_type policy_type_enum,
  monthly_premium DECIMAL(10,2),
  annual_premium DECIMAL(10,2),
  coverage_amount DECIMAL(12,2),
  coverage_summary TEXT,
  region TEXT,
  extra_benefits TEXT[],
  company_rating DECIMAL(3,2),
  instant_issue BOOLEAN,
  requires_medical_exam BOOLEAN,
  covers_pre_existing_conditions BOOLEAN,
  covers_high_risk_jobs BOOLEAN,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mp.id,
    mp.product_name,
    mp.insurer_name,
    mp.policy_type,
    mp.monthly_premium,
    mp.annual_premium,
    mp.coverage_amount,
    mp.coverage_summary,
    mp.region,
    mp.extra_benefits,
    mp.company_rating,
    mp.instant_issue,
    mp.requires_medical_exam,
    mp.covers_pre_existing_conditions,
    mp.covers_high_risk_jobs,
    mp.description
  FROM public.marketplace_products mp
  WHERE mp.is_active = true
    AND (p_policy_type IS NULL OR mp.policy_type = p_policy_type)
    AND (p_min_premium IS NULL OR mp.monthly_premium >= p_min_premium)
    AND (p_max_premium IS NULL OR mp.monthly_premium <= p_max_premium)
    AND (p_min_coverage IS NULL OR mp.coverage_amount >= p_min_coverage)
    AND (p_max_coverage IS NULL OR mp.coverage_amount <= p_max_coverage)
    AND (p_region IS NULL OR mp.region = p_region OR mp.region = 'UK-wide')
    AND (p_age IS NULL OR (mp.min_age IS NULL OR p_age >= mp.min_age) AND (mp.max_age IS NULL OR p_age <= mp.max_age))
    AND (p_min_rating IS NULL OR mp.company_rating >= p_min_rating)
    AND (p_instant_issue_only IS NULL OR p_instant_issue_only = false OR mp.instant_issue = true)
    AND (p_covers_pre_existing IS NULL OR p_covers_pre_existing = false OR mp.covers_pre_existing_conditions = true)
    AND (p_covers_high_risk_jobs IS NULL OR p_covers_high_risk_jobs = false OR mp.covers_high_risk_jobs = true)
  ORDER BY
    -- Prioritize better ratings and lower premiums
    mp.company_rating DESC,
    mp.monthly_premium ASC;
END;
$$ LANGUAGE plpgsql STABLE;
