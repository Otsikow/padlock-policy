-- Insurance Company Onboarding System Migration

-- Create enum types for insurance companies
CREATE TYPE user_role_enum AS ENUM ('customer', 'insurance_company', 'admin');
CREATE TYPE onboarding_status_enum AS ENUM ('pending_verification', 'documents_uploaded', 'under_review', 'approved', 'rejected');
CREATE TYPE verification_type_enum AS ENUM ('email', 'phone');
CREATE TYPE insurance_type_enum AS ENUM ('vehicle', 'travel', 'health', 'home', 'life', 'business', 'other');
CREATE TYPE company_document_type_enum AS ENUM ('certificate_of_incorporation', 'insurance_licence', 'proof_of_address', 'compliance_document', 'other');

-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role user_role_enum DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create insurance_companies table
CREATE TABLE public.insurance_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    legal_name TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    website TEXT,
    country TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    onboarding_status onboarding_status_enum DEFAULT 'pending_verification',
    compliance_officer_name TEXT,
    compliance_officer_email TEXT,
    compliance_officer_phone TEXT,
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create insurance_company_profiles table (branding and public info)
CREATE TABLE public.insurance_company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
    logo_url TEXT,
    brand_color_primary TEXT,
    brand_color_secondary TEXT,
    company_bio TEXT,
    office_locations JSONB, -- Array of {address, city, country, phone}
    customer_support_email TEXT,
    customer_support_phone TEXT,
    customer_support_hours TEXT,
    insurance_types insurance_type_enum[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create insurance_company_documents table
CREATE TABLE public.insurance_company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE NOT NULL,
    document_type company_document_type_enum NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create insurance_company_verifications table (OTP storage)
CREATE TABLE public.insurance_company_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE NOT NULL,
    verification_type verification_type_enum NOT NULL,
    verification_value TEXT NOT NULL, -- email or phone number
    otp_code TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_insurance_companies_user_id ON public.insurance_companies(user_id);
CREATE INDEX idx_insurance_companies_status ON public.insurance_companies(onboarding_status);
CREATE INDEX idx_insurance_company_documents_company_id ON public.insurance_company_documents(company_id);
CREATE INDEX idx_insurance_company_verifications_company_id ON public.insurance_company_verifications(company_id);

-- Enable Row Level Security
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_company_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for insurance_companies
CREATE POLICY "Companies can view their own data"
  ON public.insurance_companies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can insert their own data"
  ON public.insurance_companies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Companies can update their own data"
  ON public.insurance_companies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all companies"
  ON public.insurance_companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all companies"
  ON public.insurance_companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for insurance_company_profiles
CREATE POLICY "Companies can view their own profile"
  ON public.insurance_company_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can insert their own profile"
  ON public.insurance_company_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update their own profile"
  ON public.insurance_company_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Approved company profiles are publicly viewable"
  ON public.insurance_company_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE id = company_id AND onboarding_status = 'approved'
    )
  );

-- RLS Policies for insurance_company_documents
CREATE POLICY "Companies can view their own documents"
  ON public.insurance_company_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can insert their own documents"
  ON public.insurance_company_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all company documents"
  ON public.insurance_company_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all company documents"
  ON public.insurance_company_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for insurance_company_verifications
CREATE POLICY "Companies can view their own verifications"
  ON public.insurance_company_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert verifications"
  ON public.insurance_company_verifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update verifications"
  ON public.insurance_company_verifications
  FOR UPDATE
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_insurance_companies_updated_at
  BEFORE UPDATE ON public.insurance_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_company_profiles_updated_at
  BEFORE UPDATE ON public.insurance_company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for company documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-documents',
  'company-documents',
  false,
  104857600, -- 100MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for company document storage
CREATE POLICY "Companies can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-documents'
    AND EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE user_id = auth.uid()
      AND id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Companies can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-documents'
    AND EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE user_id = auth.uid()
      AND id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Admins can view all company documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for company logo storage
CREATE POLICY "Company logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "Companies can upload their own logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE user_id = auth.uid()
      AND id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Companies can update their own logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND EXISTS (
      SELECT 1 FROM public.insurance_companies
      WHERE user_id = auth.uid()
      AND id::text = (storage.foldername(name))[1]
    )
  );
