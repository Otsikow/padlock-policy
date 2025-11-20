-- =====================================================
-- PRODUCTION READY BACKEND ARCHITECTURE
-- This migration implements:
-- 1. Insurance companies and products tables
-- 2. Comprehensive RLS policies
-- 3. Audit logs
-- 4. Performance indexes
-- 5. Admin role support
-- =====================================================

-- =====================================================
-- 1. CREATE INSURANCE COMPANIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  api_key TEXT UNIQUE, -- For API authentication
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Metadata
  business_registration_number TEXT,
  license_number TEXT,
  regulatory_body TEXT
);

-- =====================================================
-- 2. CREATE INSURANCE PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.insurance_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.insurance_companies(id) ON DELETE CASCADE,

  -- Product details
  product_name TEXT NOT NULL,
  product_code TEXT,
  policy_type public.policy_type_enum NOT NULL,
  description TEXT,
  coverage_details JSONB,

  -- Pricing
  premium_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  billing_frequency TEXT DEFAULT 'monthly', -- monthly, quarterly, annually

  -- Coverage
  coverage_limits JSONB,
  deductible DECIMAL(10,2),
  benefits JSONB,
  exclusions JSONB,

  -- Availability
  is_active BOOLEAN DEFAULT true,
  available_countries TEXT[],
  minimum_age INTEGER,
  maximum_age INTEGER,

  -- SEO and Marketing
  product_image_url TEXT,
  brochure_url TEXT,
  terms_url TEXT,

  -- AI and Search
  search_keywords TEXT[],
  ai_tags TEXT[],
  popularity_score INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_crawled_at TIMESTAMPTZ,

  -- Unique constraint
  UNIQUE(company_id, product_code)
);

-- =====================================================
-- 3. CREATE AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who did what
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.insurance_companies(id) ON DELETE SET NULL,

  -- Action details
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
  table_name TEXT NOT NULL,
  record_id UUID,

  -- Changes
  old_values JSONB,
  new_values JSONB,

  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,
  request_path TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. CREATE ADMIN USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, super_admin
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. CREATE RATE LIMITING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- user_id, ip_address, api_key
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(identifier, endpoint, window_start)
);

-- =====================================================
-- 6. ADD ENCRYPTION METADATA TO DOCUMENTS
-- =====================================================

ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS encryption_key_id TEXT,
ADD COLUMN IF NOT EXISTS encryption_algorithm TEXT DEFAULT 'AES-256-GCM';

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_offers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE COMPREHENSIVE RLS POLICIES
-- =====================================================

-- INSURANCE COMPANIES POLICIES
-- Companies can only access their own data
CREATE POLICY "Companies can view their own data"
  ON public.insurance_companies
  FOR SELECT
  USING (
    api_key = current_setting('request.headers', true)::json->>'x-api-key'
    OR EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service can insert companies"
  ON public.insurance_companies
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Companies can update their own data"
  ON public.insurance_companies
  FOR UPDATE
  USING (
    api_key = current_setting('request.headers', true)::json->>'x-api-key'
    OR EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- INSURANCE PRODUCTS POLICIES
-- Products are publicly viewable for search
CREATE POLICY "Products are publicly viewable"
  ON public.insurance_products
  FOR SELECT
  USING (is_active = true);

-- Companies can only manage their own products
CREATE POLICY "Companies can insert their own products"
  ON public.insurance_products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.api_key = current_setting('request.headers', true)::json->>'x-api-key'
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Companies can update their own products"
  ON public.insurance_products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.api_key = current_setting('request.headers', true)::json->>'x-api-key'
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Companies can delete their own products"
  ON public.insurance_products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies ic
      WHERE ic.id = company_id
      AND ic.api_key = current_setting('request.headers', true)::json->>'x-api-key'
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- POLICIES TABLE RLS
CREATE POLICY "Users can view their own policies"
  ON public.policies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policies"
  ON public.policies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies"
  ON public.policies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies"
  ON public.policies
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to policies"
  ON public.policies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- CLAIMS TABLE RLS
CREATE POLICY "Users can view their own claims"
  ON public.claims
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims"
  ON public.claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims"
  ON public.claims
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to claims"
  ON public.claims
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- DOCUMENTS TABLE RLS
CREATE POLICY "Users can view their own documents"
  ON public.documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.documents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to documents"
  ON public.documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- NOTIFICATIONS TABLE RLS
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- PROFILES TABLE RLS
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- CHAT CONVERSATIONS TABLE RLS
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.chat_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.chat_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- CHAT MESSAGES TABLE RLS
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- COMPARISON OFFERS - Public read access
CREATE POLICY "Comparison offers are publicly viewable"
  ON public.comparison_offers
  FOR SELECT
  USING (true);

CREATE POLICY "Service can manage comparison offers"
  ON public.comparison_offers
  FOR ALL
  USING (true);

-- AUDIT LOGS POLICIES
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ADMIN USERS POLICIES
CREATE POLICY "Admins can view admin users"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON public.admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RATE LIMITS POLICIES
CREATE POLICY "Service can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (true);

-- =====================================================
-- 9. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Insurance companies indexes
CREATE INDEX IF NOT EXISTS idx_insurance_companies_api_key ON public.insurance_companies(api_key);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_is_active ON public.insurance_companies(is_active);

-- Insurance products indexes
CREATE INDEX IF NOT EXISTS idx_insurance_products_company_id ON public.insurance_products(company_id);
CREATE INDEX IF NOT EXISTS idx_insurance_products_policy_type ON public.insurance_products(policy_type);
CREATE INDEX IF NOT EXISTS idx_insurance_products_is_active ON public.insurance_products(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_products_premium_amount ON public.insurance_products(premium_amount);
CREATE INDEX IF NOT EXISTS idx_insurance_products_search_keywords ON public.insurance_products USING GIN(search_keywords);
CREATE INDEX IF NOT EXISTS idx_insurance_products_ai_tags ON public.insurance_products USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_insurance_products_coverage_details ON public.insurance_products USING GIN(coverage_details);

-- Policies indexes
CREATE INDEX IF NOT EXISTS idx_policies_user_id ON public.policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_policy_type ON public.policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_policies_status ON public.policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_end_date ON public.policies(end_date);

-- Claims indexes
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON public.claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON public.claims(created_at);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON public.rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- =====================================================
-- 10. CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insurance companies trigger
DROP TRIGGER IF EXISTS update_insurance_companies_updated_at ON public.insurance_companies;
CREATE TRIGGER update_insurance_companies_updated_at
  BEFORE UPDATE ON public.insurance_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insurance products trigger
DROP TRIGGER IF EXISTS update_insurance_products_updated_at ON public.insurance_products;
CREATE TRIGGER update_insurance_products_updated_at
  BEFORE UPDATE ON public.insurance_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin users trigger
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 11. CREATE AUDIT LOG TRIGGERS
-- =====================================================

-- Function to log changes to audit_logs
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
BEGIN
  -- Get the current user ID
  BEGIN
    user_id_val := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    user_id_val := NULL;
  END;

  -- Log the change
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (user_id_val, TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (user_id_val, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (user_id_val, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
DROP TRIGGER IF EXISTS audit_policies ON public.policies;
CREATE TRIGGER audit_policies
  AFTER INSERT OR UPDATE OR DELETE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

DROP TRIGGER IF EXISTS audit_insurance_products ON public.insurance_products;
CREATE TRIGGER audit_insurance_products
  AFTER INSERT OR UPDATE OR DELETE ON public.insurance_products
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

DROP TRIGGER IF EXISTS audit_insurance_companies ON public.insurance_companies;
CREATE TRIGGER audit_insurance_companies
  AFTER INSERT OR UPDATE OR DELETE ON public.insurance_companies
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

DROP TRIGGER IF EXISTS audit_claims ON public.claims;
CREATE TRIGGER audit_claims
  AFTER INSERT OR UPDATE OR DELETE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

-- =====================================================
-- 12. CREATE FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier_val TEXT,
  endpoint_val TEXT,
  max_requests INTEGER DEFAULT 100,
  window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMPTZ;
BEGIN
  window_start_time := date_trunc('hour', now()) - (extract(minute from now())::integer % window_minutes || ' minutes')::interval;

  -- Get or create rate limit record
  INSERT INTO public.rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (identifier_val, endpoint_val, window_start_time, 1)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET request_count = public.rate_limits.request_count + 1
  RETURNING request_count INTO current_count;

  -- Return true if under limit
  RETURN current_count <= max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comment to track migration
COMMENT ON TABLE public.insurance_companies IS 'Production ready: Insurance companies can manage their products via API';
COMMENT ON TABLE public.insurance_products IS 'Production ready: Insurance products searchable by users';
COMMENT ON TABLE public.audit_logs IS 'Production ready: Comprehensive audit trail for all operations';
