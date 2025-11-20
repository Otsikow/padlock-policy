-- =====================================================
-- MARKETPLACE TABLES MIGRATION
-- Creates insurance_companies and insurance_products tables
-- with comprehensive RLS policies for marketplace and partner portal
-- =====================================================

-- Note: This migration uses CREATE TABLE IF NOT EXISTS to avoid conflicts
-- with existing migrations. If tables exist, we add missing columns via ALTER TABLE.

-- =====================================================
-- 1. CREATE OR MERGE INSURANCE_COMPANIES TABLE
-- =====================================================

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns that may be missing (from various migrations)
DO $$
BEGIN
  -- Basic Information
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS display_name TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS registration_number TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS license_number TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS regulatory_body TEXT;

  -- Contact Information
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS website TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS contact_email TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS contact_phone TEXT;

  -- Address
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS address TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS city TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS country TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS postal_code TEXT;

  -- Branding
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS brand_color_primary TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS brand_color_secondary TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS company_bio TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS company_description TEXT;

  -- Status & Verification
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;

  -- Onboarding
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending_verification';

  -- Compliance
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS compliance_officer_name TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS compliance_officer_email TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS compliance_officer_phone TEXT;

  -- Approval
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS approved_by UUID;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

  -- API
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS api_key TEXT;

  -- Analytics
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS ai_quality_score DECIMAL(3,2) DEFAULT 0.00;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS total_products INTEGER DEFAULT 0;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS total_conversions INTEGER DEFAULT 0;

  -- Metadata
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS office_locations JSONB;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS insurance_types TEXT[];
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS customer_support_email TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS customer_support_phone TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS customer_support_hours TEXT;

  -- Legacy fields from partner dashboard
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS company_name TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS company_registration_number TEXT;
  ALTER TABLE public.insurance_companies ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

END $$;

-- Update display_name from legal_name or company_name if null
UPDATE public.insurance_companies
SET display_name = COALESCE(display_name, legal_name, company_name)
WHERE display_name IS NULL;

-- Create unique constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'insurance_companies_registration_number_key'
  ) THEN
    -- Only add if registration_number has values
    IF EXISTS (SELECT 1 FROM public.insurance_companies WHERE registration_number IS NOT NULL) THEN
      ALTER TABLE public.insurance_companies
        ADD CONSTRAINT insurance_companies_registration_number_key
        UNIQUE (registration_number);
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'insurance_companies_api_key_key'
  ) THEN
    ALTER TABLE public.insurance_companies
      ADD CONSTRAINT insurance_companies_api_key_key
      UNIQUE (api_key);
  END IF;
END $$;

-- =====================================================
-- 2. CREATE OR MERGE INSURANCE_PRODUCTS TABLE
-- =====================================================

-- Create the table if it doesn't exist (with company_id)
CREATE TABLE IF NOT EXISTS public.insurance_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.insurance_companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  premium_start_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add all possible columns from different migrations
DO $$
BEGIN
  -- Product Details
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS product_code TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS short_summary TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS full_description TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS target_users TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS coverage_details JSONB;

  -- Geographic
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS region_country TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS available_countries TEXT[];
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS region TEXT;

  -- Pricing
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS monthly_premium DECIMAL(10,2);
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS annual_premium DECIMAL(10,2);
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS premium_amount DECIMAL(10,2);
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS billing_frequency TEXT DEFAULT 'monthly';

  -- Coverage
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS coverage_amount DECIMAL(12,2);
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS coverage_limits JSONB;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS deductible DECIMAL(10,2);
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS excess_deductibles JSONB;

  -- Benefits & Exclusions
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS key_benefits TEXT[];
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS extra_benefits TEXT[];
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS benefits JSONB;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS exclusions_list TEXT[];
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS exclusions JSONB;

  -- Add-ons
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS add_ons JSONB;

  -- Eligibility
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS minimum_age INTEGER;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS maximum_age INTEGER;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS min_age INTEGER;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS max_age INTEGER;

  -- Marketplace Features
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS instant_issue BOOLEAN DEFAULT false;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS requires_medical_exam BOOLEAN DEFAULT false;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS covers_pre_existing_conditions BOOLEAN DEFAULT false;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS covers_high_risk_jobs BOOLEAN DEFAULT false;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS company_rating DECIMAL(2,1) DEFAULT 0.0;

  -- AI Content
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS ai_generated_description TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS ai_generated_exclusions TEXT[];
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS ai_generated_marketing_copy TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS ai_generated_faq JSONB;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS ai_quality_score DECIMAL(3,2) DEFAULT 0.00;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS ai_summary TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS ai_tags TEXT[];

  -- Workflow
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS admin_notes TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS approved_by UUID;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

  -- Analytics
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;

  -- Marketing
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS product_image_url TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS brochure_url TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS terms_url TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS search_keywords TEXT[];
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS coverage_summary TEXT;
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS contact_info JSONB;

  -- Timestamps
  ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMPTZ;

  -- Legacy field from partner dashboard (if it exists, we'll handle it differently)
  -- ALTER TABLE public.insurance_products ADD COLUMN IF NOT EXISTS partner_id UUID;

END $$;

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Insurance Companies Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_companies_user_id ON public.insurance_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_api_key ON public.insurance_companies(api_key);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_is_active ON public.insurance_companies(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_onboarding_status ON public.insurance_companies(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_is_verified ON public.insurance_companies(is_verified);

-- Insurance Products Indexes
CREATE INDEX IF NOT EXISTS idx_insurance_products_company_id ON public.insurance_products(company_id);
CREATE INDEX IF NOT EXISTS idx_insurance_products_insurance_type ON public.insurance_products(insurance_type);
CREATE INDEX IF NOT EXISTS idx_insurance_products_status ON public.insurance_products(status);
CREATE INDEX IF NOT EXISTS idx_insurance_products_is_active ON public.insurance_products(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_products_premium ON public.insurance_products(premium_start_price);
CREATE INDEX IF NOT EXISTS idx_insurance_products_monthly_premium ON public.insurance_products(monthly_premium);
CREATE INDEX IF NOT EXISTS idx_insurance_products_region ON public.insurance_products(region);
CREATE INDEX IF NOT EXISTS idx_insurance_products_company_rating ON public.insurance_products(company_rating);

-- GIN Indexes for Array and JSONB Columns
CREATE INDEX IF NOT EXISTS idx_insurance_products_search_keywords ON public.insurance_products USING GIN(search_keywords);
CREATE INDEX IF NOT EXISTS idx_insurance_products_ai_tags ON public.insurance_products USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_insurance_products_coverage_limits ON public.insurance_products USING GIN(coverage_limits);
CREATE INDEX IF NOT EXISTS idx_insurance_products_benefits ON public.insurance_products USING GIN(key_benefits);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_insurance_types ON public.insurance_companies USING GIN(insurance_types);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES FOR INSURANCE_COMPANIES
-- =====================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Companies can view their own data" ON public.insurance_companies;
DROP POLICY IF EXISTS "Companies can insert their own data" ON public.insurance_companies;
DROP POLICY IF EXISTS "Companies can update their own data" ON public.insurance_companies;
DROP POLICY IF EXISTS "Admins can view all companies" ON public.insurance_companies;
DROP POLICY IF EXISTS "Admins can update all companies" ON public.insurance_companies;
DROP POLICY IF EXISTS "Approved companies are publicly viewable" ON public.insurance_companies;
DROP POLICY IF EXISTS "Partners can view their own partner profile" ON public.insurance_companies;
DROP POLICY IF EXISTS "Partners can insert their own partner profile" ON public.insurance_companies;
DROP POLICY IF EXISTS "Partners can update their own partner profile" ON public.insurance_companies;
DROP POLICY IF EXISTS "Admins can view all partner profiles" ON public.insurance_companies;
DROP POLICY IF EXISTS "Service can insert companies" ON public.insurance_companies;

-- Policy: Companies can view their own data
CREATE POLICY "Companies can view their own data"
  ON public.insurance_companies
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (api_key IS NOT NULL AND api_key = current_setting('request.headers', true)::json->>'x-api-key')
  );

-- Policy: Companies can insert their own data
CREATE POLICY "Companies can insert their own data"
  ON public.insurance_companies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Companies can update their own data
CREATE POLICY "Companies can update their own data"
  ON public.insurance_companies
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (api_key IS NOT NULL AND api_key = current_setting('request.headers', true)::json->>'x-api-key')
  );

-- Policy: Admins can view all companies
CREATE POLICY "Admins can view all companies"
  ON public.insurance_companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (user_role = 'admin' OR role = 'admin')
    )
  );

-- Policy: Admins can update all companies
CREATE POLICY "Admins can update all companies"
  ON public.insurance_companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (user_role = 'admin' OR role = 'admin')
    )
  );

-- Policy: Public can view approved companies
CREATE POLICY "Approved companies are publicly viewable"
  ON public.insurance_companies
  FOR SELECT
  USING (
    is_active = true
    AND is_verified = true
    AND onboarding_status = 'approved'
  );

-- =====================================================
-- 6. CREATE RLS POLICIES FOR INSURANCE_PRODUCTS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Companies can view their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Companies can insert their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Companies can update their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Companies can delete their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Active products are publicly viewable" ON public.insurance_products;
DROP POLICY IF EXISTS "Products are publicly viewable" ON public.insurance_products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.insurance_products;
DROP POLICY IF EXISTS "Admins can update all products" ON public.insurance_products;
DROP POLICY IF EXISTS "Partners can view their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Partners can insert their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Partners can update their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Partners can delete their own products" ON public.insurance_products;
DROP POLICY IF EXISTS "Consumers can view active products" ON public.insurance_products;

-- Policy: Companies can view their own products
CREATE POLICY "Companies can view their own products"
  ON public.insurance_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.api_key IS NOT NULL
      AND ic.api_key = current_setting('request.headers', true)::json->>'x-api-key'
    )
  );

-- Policy: Companies can insert their own products
CREATE POLICY "Companies can insert their own products"
  ON public.insurance_products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.api_key IS NOT NULL
      AND ic.api_key = current_setting('request.headers', true)::json->>'x-api-key'
    )
  );

-- Policy: Companies can update their own products
CREATE POLICY "Companies can update their own products"
  ON public.insurance_products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.api_key IS NOT NULL
      AND ic.api_key = current_setting('request.headers', true)::json->>'x-api-key'
    )
  );

-- Policy: Companies can delete their own products
CREATE POLICY "Companies can delete their own products"
  ON public.insurance_products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.user_id = auth.uid()
    )
  );

-- Policy: Active products are publicly viewable
CREATE POLICY "Active products are publicly viewable"
  ON public.insurance_products
  FOR SELECT
  USING (
    status = 'active'
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.is_active = true
      AND ic.is_verified = true
      AND ic.onboarding_status = 'approved'
    )
  );

-- Policy: Admins can view all products
CREATE POLICY "Admins can view all products"
  ON public.insurance_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (user_role = 'admin' OR role = 'admin')
    )
  );

-- Policy: Admins can update all products
CREATE POLICY "Admins can update all products"
  ON public.insurance_products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND (user_role = 'admin' OR role = 'admin')
    )
  );

-- =====================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_insurance_companies_updated_at ON public.insurance_companies;
CREATE TRIGGER update_insurance_companies_updated_at
  BEFORE UPDATE ON public.insurance_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_products_updated_at ON public.insurance_products;
CREATE TRIGGER update_insurance_products_updated_at
  BEFORE UPDATE ON public.insurance_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. CREATE ANALYTICS FUNCTIONS
-- =====================================================

-- Function to increment product view count
CREATE OR REPLACE FUNCTION public.increment_product_view(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.insurance_products
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = product_uuid;

  UPDATE public.insurance_companies
  SET total_views = COALESCE(total_views, 0) + 1
  WHERE id = (SELECT company_id FROM public.insurance_products WHERE id = product_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product click count
CREATE OR REPLACE FUNCTION public.increment_product_click(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.insurance_products
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = product_uuid;

  UPDATE public.insurance_companies
  SET total_clicks = COALESCE(total_clicks, 0) + 1
  WHERE id = (SELECT company_id FROM public.insurance_products WHERE id = product_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product conversion count
CREATE OR REPLACE FUNCTION public.increment_product_conversion(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.insurance_products
  SET conversion_count = COALESCE(conversion_count, 0) + 1
  WHERE id = product_uuid;

  UPDATE public.insurance_companies
  SET total_conversions = COALESCE(total_conversions, 0) + 1
  WHERE id = (SELECT company_id FROM public.insurance_products WHERE id = product_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update company stats
CREATE OR REPLACE FUNCTION public.update_company_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.insurance_companies
    SET total_products = (
      SELECT COUNT(*)
      FROM public.insurance_products
      WHERE company_id = OLD.company_id
      AND status IN ('active', 'paused')
    )
    WHERE id = OLD.company_id;
    RETURN OLD;
  ELSE
    UPDATE public.insurance_companies
    SET total_products = (
      SELECT COUNT(*)
      FROM public.insurance_products
      WHERE company_id = NEW.company_id
      AND status IN ('active', 'paused')
    )
    WHERE id = NEW.company_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_company_stats_trigger ON public.insurance_products;
CREATE TRIGGER update_company_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.insurance_products
  FOR EACH ROW EXECUTE FUNCTION public.update_company_stats();

-- =====================================================
-- 9. CREATE SEARCH FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_marketplace_products(
  search_query TEXT DEFAULT NULL,
  filter_insurance_type TEXT DEFAULT NULL,
  filter_min_premium DECIMAL DEFAULT NULL,
  filter_max_premium DECIMAL DEFAULT NULL,
  filter_region TEXT DEFAULT NULL,
  filter_min_age INTEGER DEFAULT NULL,
  filter_max_age INTEGER DEFAULT NULL,
  filter_min_rating DECIMAL DEFAULT NULL,
  filter_instant_issue BOOLEAN DEFAULT NULL,
  filter_covers_pre_existing BOOLEAN DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  product_name TEXT,
  insurance_type TEXT,
  monthly_premium DECIMAL,
  coverage_amount DECIMAL,
  region TEXT,
  company_rating DECIMAL,
  instant_issue BOOLEAN,
  company_name TEXT,
  company_logo TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ip.id,
    ip.company_id,
    ip.product_name,
    ip.insurance_type,
    COALESCE(ip.monthly_premium, ip.premium_start_price) as monthly_premium,
    ip.coverage_amount,
    ip.region,
    ip.company_rating,
    ip.instant_issue,
    COALESCE(ic.display_name, ic.legal_name, ic.company_name) as company_name,
    COALESCE(ic.logo_url, ic.company_logo_url) as company_logo
  FROM public.insurance_products ip
  JOIN public.insurance_companies ic ON ip.company_id = ic.id
  WHERE
    ip.status = 'active'
    AND ip.is_active = true
    AND ic.is_active = true
    AND COALESCE(ic.is_verified, false) = true
    AND COALESCE(ic.onboarding_status, 'approved') = 'approved'
    AND (filter_insurance_type IS NULL OR ip.insurance_type = filter_insurance_type)
    AND (filter_min_premium IS NULL OR COALESCE(ip.monthly_premium, ip.premium_start_price) >= filter_min_premium)
    AND (filter_max_premium IS NULL OR COALESCE(ip.monthly_premium, ip.premium_start_price) <= filter_max_premium)
    AND (filter_region IS NULL OR ip.region = filter_region)
    AND (filter_min_age IS NULL OR COALESCE(ip.min_age, ip.minimum_age) IS NULL OR COALESCE(ip.min_age, ip.minimum_age) <= filter_min_age)
    AND (filter_max_age IS NULL OR COALESCE(ip.max_age, ip.maximum_age) IS NULL OR COALESCE(ip.max_age, ip.maximum_age) >= filter_max_age)
    AND (filter_min_rating IS NULL OR COALESCE(ip.company_rating, 0) >= filter_min_rating)
    AND (filter_instant_issue IS NULL OR ip.instant_issue = filter_instant_issue)
    AND (filter_covers_pre_existing IS NULL OR ip.covers_pre_existing_conditions = filter_covers_pre_existing)
    AND (
      search_query IS NULL
      OR ip.product_name ILIKE '%' || search_query || '%'
      OR COALESCE(ip.short_summary, '') ILIKE '%' || search_query || '%'
      OR COALESCE(ip.full_description, ip.description, '') ILIKE '%' || search_query || '%'
      OR COALESCE(ic.display_name, ic.legal_name, ic.company_name, '') ILIKE '%' || search_query || '%'
    )
  ORDER BY COALESCE(ip.popularity_score, 0) DESC, ip.company_rating DESC, COALESCE(ip.monthly_premium, ip.premium_start_price) ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE public.insurance_companies IS 'Marketplace: Insurance companies/partners with comprehensive features for onboarding, verification, and analytics';
COMMENT ON TABLE public.insurance_products IS 'Marketplace: Insurance products with AI features, pricing, and marketplace visibility for approved companies';
