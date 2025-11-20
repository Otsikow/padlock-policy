-- Migration for Admin Dashboard
-- Adds tables and enums for insurance companies, products, AI operations, and analytics

-- ============================================
-- ENUMS
-- ============================================

-- User roles
CREATE TYPE public.user_role_enum AS ENUM ('customer', 'partner', 'admin');

-- Company status
CREATE TYPE public.company_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'disabled');

-- Product status
CREATE TYPE public.product_status_enum AS ENUM ('draft', 'pending', 'approved', 'rejected', 'paused', 'active', 'archived');

-- Insurance product type
CREATE TYPE public.insurance_type_enum AS ENUM ('health', 'auto', 'life', 'home', 'travel', 'business', 'pet', 'other');

-- AI operation status
CREATE TYPE public.ai_operation_status_enum AS ENUM ('running', 'completed', 'failed', 'paused');

-- Verification status
CREATE TYPE public.verification_status_enum AS ENUM ('pending', 'approved', 'rejected', 'additional_docs_required');

-- ============================================
-- ADD ROLE TO PROFILES
-- ============================================

-- Add role column to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.user_role_enum NOT NULL DEFAULT 'customer';

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ============================================
-- INSURANCE COMPANIES TABLE
-- ============================================

CREATE TABLE public.insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Company information
  company_name TEXT NOT NULL,
  company_number TEXT UNIQUE, -- Registration number
  trading_name TEXT,
  website_url TEXT,
  email TEXT NOT NULL,
  phone TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'GB',

  -- Legal & Compliance
  fca_number TEXT, -- Financial Conduct Authority number (UK)
  vat_number TEXT,
  company_type TEXT, -- e.g., "Limited Company", "PLC"

  -- Status & Verification
  status public.company_status_enum NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),

  -- Documents
  kyc_documents JSONB DEFAULT '[]'::jsonb, -- Array of document URLs
  compliance_documents JSONB DEFAULT '[]'::jsonb,

  -- Settings
  logo_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX insurance_companies_partner_id_idx ON public.insurance_companies(partner_id);
CREATE INDEX insurance_companies_status_idx ON public.insurance_companies(status);
CREATE INDEX insurance_companies_created_at_idx ON public.insurance_companies(created_at DESC);

-- ============================================
-- PRODUCTS TABLE
-- ============================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE NOT NULL,

  -- Product details
  product_name TEXT NOT NULL,
  product_type public.insurance_type_enum NOT NULL,
  description TEXT,
  coverage_details JSONB DEFAULT '{}'::jsonb, -- Structured coverage data

  -- Pricing
  base_premium DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  premium_frequency TEXT DEFAULT 'monthly', -- monthly, yearly, one-off

  -- Coverage amounts
  coverage_amount DECIMAL(12,2),
  excess_amount DECIMAL(10,2),

  -- Eligibility
  min_age INTEGER,
  max_age INTEGER,
  geographic_coverage JSONB DEFAULT '["GB"]'::jsonb, -- Array of country codes
  exclusions TEXT,

  -- Status & Approval
  status public.product_status_enum NOT NULL DEFAULT 'draft',
  admin_notes TEXT,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),

  -- AI Processing
  ai_normalized_data JSONB DEFAULT '{}'::jsonb,
  ai_risk_flags JSONB DEFAULT '[]'::jsonb, -- Array of risk indicators
  data_source TEXT, -- 'manual', 'crawled', 'api'
  source_url TEXT,
  last_crawled_at TIMESTAMPTZ,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX products_company_id_idx ON public.products(company_id);
CREATE INDEX products_status_idx ON public.products(status);
CREATE INDEX products_product_type_idx ON public.products(product_type);
CREATE INDEX products_created_at_idx ON public.products(created_at DESC);
CREATE INDEX products_base_premium_idx ON public.products(base_premium);

-- ============================================
-- PRODUCT VERIFICATIONS TABLE
-- ============================================

CREATE TABLE public.product_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,

  status public.verification_status_enum NOT NULL,
  comments TEXT,
  requested_documents TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX product_verifications_product_id_idx ON public.product_verifications(product_id);
CREATE INDEX product_verifications_created_at_idx ON public.product_verifications(created_at DESC);

-- ============================================
-- AI CRAWL LOGS TABLE
-- ============================================

CREATE TABLE public.ai_crawl_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Operation details
  operation_type TEXT NOT NULL, -- 'scrape', 'api_sync', 'normalize', 're-crawl'
  target_url TEXT,
  target_company_id UUID REFERENCES public.insurance_companies(id),

  -- Status
  status public.ai_operation_status_enum NOT NULL DEFAULT 'running',

  -- Results
  products_found INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_created INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,

  -- Configuration
  crawl_rules JSONB DEFAULT '{}'::jsonb,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Triggered by
  triggered_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ai_crawl_logs_status_idx ON public.ai_crawl_logs(status);
CREATE INDEX ai_crawl_logs_created_at_idx ON public.ai_crawl_logs(created_at DESC);
CREATE INDEX ai_crawl_logs_company_id_idx ON public.ai_crawl_logs(target_company_id);

-- ============================================
-- SEARCH QUERIES TABLE (Analytics)
-- ============================================

CREATE TABLE public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Search details
  query_text TEXT NOT NULL,
  insurance_type public.insurance_type_enum,
  filters JSONB DEFAULT '{}'::jsonb,

  -- Results
  results_count INTEGER DEFAULT 0,
  clicked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

  -- User context
  user_country TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX search_queries_user_id_idx ON public.search_queries(user_id);
CREATE INDEX search_queries_created_at_idx ON public.search_queries(created_at DESC);
CREATE INDEX search_queries_insurance_type_idx ON public.search_queries(insurance_type);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event details
  event_type TEXT NOT NULL, -- 'product_view', 'product_click', 'conversion', 'quote_request'
  event_category TEXT, -- 'engagement', 'conversion', 'navigation'

  -- Related entities
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.insurance_companies(id) ON DELETE SET NULL,

  -- Event metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- User context
  user_country TEXT,
  user_region TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_event_type_idx ON public.analytics_events(event_type);
CREATE INDEX analytics_events_created_at_idx ON public.analytics_events(created_at DESC);
CREATE INDEX analytics_events_product_id_idx ON public.analytics_events(product_id);
CREATE INDEX analytics_events_company_id_idx ON public.analytics_events(company_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_crawl_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Update RLS to allow role-based access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('partner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insurance Companies policies
CREATE POLICY "Admins can view all companies"
  ON public.insurance_companies
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Partners can view their own company"
  ON public.insurance_companies
  FOR SELECT
  USING (partner_id = auth.uid());

CREATE POLICY "Public can view approved companies"
  ON public.insurance_companies
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Partners can insert their company"
  ON public.insurance_companies
  FOR INSERT
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update their own company"
  ON public.insurance_companies
  FOR UPDATE
  USING (partner_id = auth.uid());

CREATE POLICY "Admins can update any company"
  ON public.insurance_companies
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete companies"
  ON public.insurance_companies
  FOR DELETE
  USING (public.is_admin());

-- Products policies
CREATE POLICY "Admins can view all products"
  ON public.products
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Partners can view their own products"
  ON public.products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE insurance_companies.id = products.company_id
      AND insurance_companies.partner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active/approved products"
  ON public.products
  FOR SELECT
  USING (status IN ('active', 'approved'));

CREATE POLICY "Partners can create products for their company"
  ON public.products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE insurance_companies.id = products.company_id
      AND insurance_companies.partner_id = auth.uid()
    )
  );

CREATE POLICY "Partners can update their own products"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE insurance_companies.id = products.company_id
      AND insurance_companies.partner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update any product"
  ON public.products
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (public.is_admin());

-- Product Verifications policies
CREATE POLICY "Admins can manage verifications"
  ON public.product_verifications
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "Partners can view their product verifications"
  ON public.product_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.insurance_companies ic ON p.company_id = ic.id
      WHERE p.id = product_verifications.product_id
      AND ic.partner_id = auth.uid()
    )
  );

-- AI Crawl Logs policies
CREATE POLICY "Admins can view all crawl logs"
  ON public.ai_crawl_logs
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage crawl logs"
  ON public.ai_crawl_logs
  FOR ALL
  USING (public.is_admin());

-- Search Queries policies
CREATE POLICY "Admins can view all search queries"
  ON public.search_queries
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can view their own queries"
  ON public.search_queries
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert search queries"
  ON public.search_queries
  FOR INSERT
  WITH CHECK (true);

-- Analytics Events policies
CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_insurance_companies_updated_at
  BEFORE UPDATE ON public.insurance_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_verifications_updated_at
  BEFORE UPDATE ON public.product_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - Admin user example)
-- ============================================

-- Note: To create an actual admin user, you'll need to:
-- 1. Sign up a user through the normal flow
-- 2. Then run: UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
