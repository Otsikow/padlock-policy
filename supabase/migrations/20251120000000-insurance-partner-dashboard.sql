-- Insurance Partner Dashboard Schema Migration
-- This migration adds support for insurance companies to manage their products

-- Create enum types for partner dashboard
CREATE TYPE user_role_enum AS ENUM ('consumer', 'partner', 'admin');
CREATE TYPE product_status_enum AS ENUM ('draft', 'pending_review', 'active', 'paused', 'archived');
CREATE TYPE insurance_type_enum AS ENUM ('health', 'auto', 'life', 'home', 'travel', 'business', 'pet', 'other');
CREATE TYPE media_type_enum AS ENUM ('logo', 'banner', 'icon', 'thumbnail');
CREATE TYPE document_category_enum AS ENUM ('policy_wording', 'product_brochure', 'terms_conditions', 'other');
CREATE TYPE rule_action_enum AS ENUM ('reject', 'increase_premium', 'decrease_premium', 'require_approval', 'flag_for_review');

-- Update profiles table to add user role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role user_role_enum DEFAULT 'consumer';

-- Create Insurance Partners Table
CREATE TABLE public.insurance_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    company_registration_number TEXT,
    company_logo_url TEXT,
    company_description TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website_url TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    postal_code TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    ai_quality_score DECIMAL(3,2) DEFAULT 0.00, -- Score from 0.00 to 5.00
    total_products INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create Insurance Products Table
CREATE TABLE public.insurance_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.insurance_partners(id) ON DELETE CASCADE NOT NULL,

    -- Product Basics
    product_name TEXT NOT NULL,
    insurance_type insurance_type_enum NOT NULL,
    short_summary TEXT,
    full_description TEXT,
    target_users TEXT,
    region_country TEXT,
    premium_start_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',

    -- Coverage Details
    coverage_limits JSONB, -- Flexible structure for different insurance types
    excess_deductibles JSONB,
    add_ons JSONB, -- Array of add-on options
    exclusions_list TEXT[],
    key_benefits TEXT[],

    -- AI Generated Content
    ai_generated_description TEXT,
    ai_generated_exclusions TEXT[],
    ai_generated_marketing_copy TEXT,
    ai_generated_faq JSONB, -- Array of {question, answer} objects
    ai_quality_score DECIMAL(3,2) DEFAULT 0.00,

    -- Product Status & Workflow
    status product_status_enum DEFAULT 'draft',
    admin_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,

    -- Analytics
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT valid_premium CHECK (premium_start_price >= 0),
    CONSTRAINT valid_ai_score CHECK (ai_quality_score >= 0.00 AND ai_quality_score <= 5.00)
);

-- Create Product Media Table
CREATE TABLE public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.insurance_products(id) ON DELETE CASCADE NOT NULL,
    media_type media_type_enum NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Underwriting Rules Table
CREATE TABLE public.underwriting_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.insurance_products(id) ON DELETE CASCADE NOT NULL,
    rule_name TEXT NOT NULL,
    rule_description TEXT,

    -- Rule Conditions (flexible JSON structure)
    conditions JSONB NOT NULL, -- e.g., {"age": {"min": 18, "max": 65}, "vehicle_type": ["sedan", "suv"]}

    -- Rule Action
    action rule_action_enum NOT NULL,
    action_value DECIMAL(5,2), -- For premium adjustments (percentage)
    action_message TEXT, -- Message to display to user

    -- Rule Priority & Status
    priority INTEGER DEFAULT 0, -- Higher priority rules evaluated first
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Product Documents Table
CREATE TABLE public.product_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.insurance_products(id) ON DELETE CASCADE NOT NULL,
    document_category document_category_enum NOT NULL,
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT, -- e.g., 'application/pdf'
    version TEXT DEFAULT '1.0',
    is_current BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Product Stats Table (for detailed analytics tracking)
CREATE TABLE public.product_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.insurance_products(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    quote_requests INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, date) -- One record per product per day
);

-- Create indexes for better query performance
CREATE INDEX idx_insurance_partners_user_id ON public.insurance_partners(user_id);
CREATE INDEX idx_insurance_products_partner_id ON public.insurance_products(partner_id);
CREATE INDEX idx_insurance_products_status ON public.insurance_products(status);
CREATE INDEX idx_insurance_products_insurance_type ON public.insurance_products(insurance_type);
CREATE INDEX idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX idx_underwriting_rules_product_id ON public.underwriting_rules(product_id);
CREATE INDEX idx_product_documents_product_id ON public.product_documents(product_id);
CREATE INDEX idx_product_stats_product_id_date ON public.product_stats(product_id, date);

-- Enable Row Level Security
ALTER TABLE public.insurance_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.underwriting_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Insurance Partners Table
CREATE POLICY "Partners can view their own partner profile" ON public.insurance_partners
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert their own partner profile" ON public.insurance_partners
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update their own partner profile" ON public.insurance_partners
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all partner profiles" ON public.insurance_partners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_role = 'admin'
        )
    );

-- RLS Policies for Insurance Products Table
CREATE POLICY "Partners can view their own products" ON public.insurance_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.insurance_partners
            WHERE insurance_partners.id = partner_id
            AND insurance_partners.user_id = auth.uid()
        )
    );

CREATE POLICY "Partners can insert their own products" ON public.insurance_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.insurance_partners
            WHERE insurance_partners.id = partner_id
            AND insurance_partners.user_id = auth.uid()
        )
    );

CREATE POLICY "Partners can update their own products" ON public.insurance_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.insurance_partners
            WHERE insurance_partners.id = partner_id
            AND insurance_partners.user_id = auth.uid()
        )
    );

CREATE POLICY "Partners can delete their own products" ON public.insurance_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.insurance_partners
            WHERE insurance_partners.id = partner_id
            AND insurance_partners.user_id = auth.uid()
        )
    );

CREATE POLICY "Consumers can view active products" ON public.insurance_products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all products" ON public.insurance_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_role = 'admin'
        )
    );

CREATE POLICY "Admins can update all products" ON public.insurance_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_role = 'admin'
        )
    );

-- RLS Policies for Product Media Table
CREATE POLICY "Partners can manage media for their products" ON public.product_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.insurance_products ip
            JOIN public.insurance_partners part ON ip.partner_id = part.id
            WHERE ip.id = product_id
            AND part.user_id = auth.uid()
        )
    );

CREATE POLICY "Consumers can view media for active products" ON public.product_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.insurance_products
            WHERE id = product_id AND status = 'active'
        )
    );

-- RLS Policies for Underwriting Rules Table
CREATE POLICY "Partners can manage rules for their products" ON public.underwriting_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.insurance_products ip
            JOIN public.insurance_partners part ON ip.partner_id = part.id
            WHERE ip.id = product_id
            AND part.user_id = auth.uid()
        )
    );

-- RLS Policies for Product Documents Table
CREATE POLICY "Partners can manage documents for their products" ON public.product_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.insurance_products ip
            JOIN public.insurance_partners part ON ip.partner_id = part.id
            WHERE ip.id = product_id
            AND part.user_id = auth.uid()
        )
    );

CREATE POLICY "Consumers can view documents for active products" ON public.product_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.insurance_products
            WHERE id = product_id AND status = 'active'
        )
    );

-- RLS Policies for Product Stats Table
CREATE POLICY "Partners can view stats for their products" ON public.product_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.insurance_products ip
            JOIN public.insurance_partners part ON ip.partner_id = part.id
            WHERE ip.id = product_id
            AND part.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert/update product stats" ON public.product_stats
    FOR ALL USING (true); -- Stats are updated by backend functions

-- Add updated_at triggers
CREATE TRIGGER update_insurance_partners_updated_at BEFORE UPDATE ON public.insurance_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_products_updated_at BEFORE UPDATE ON public.insurance_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_media_updated_at BEFORE UPDATE ON public.product_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_underwriting_rules_updated_at BEFORE UPDATE ON public.underwriting_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_documents_updated_at BEFORE UPDATE ON public.product_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update partner stats when products change
CREATE OR REPLACE FUNCTION update_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_products count for the partner
    UPDATE public.insurance_partners
    SET total_products = (
        SELECT COUNT(*)
        FROM public.insurance_products
        WHERE partner_id = NEW.partner_id
        AND status IN ('active', 'paused')
    )
    WHERE id = NEW.partner_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update partner stats
CREATE TRIGGER update_partner_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.insurance_products
FOR EACH ROW EXECUTE FUNCTION update_partner_stats();

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(product_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Update product view count
    UPDATE public.insurance_products
    SET view_count = view_count + 1
    WHERE id = product_uuid;

    -- Update daily stats
    INSERT INTO public.product_stats (product_id, date, views)
    VALUES (product_uuid, CURRENT_DATE, 1)
    ON CONFLICT (product_id, date)
    DO UPDATE SET views = product_stats.views + 1;

    -- Update partner total views
    UPDATE public.insurance_partners
    SET total_views = total_views + 1
    WHERE id = (SELECT partner_id FROM public.insurance_products WHERE id = product_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product click count
CREATE OR REPLACE FUNCTION increment_product_click(product_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Update product click count
    UPDATE public.insurance_products
    SET click_count = click_count + 1
    WHERE id = product_uuid;

    -- Update daily stats
    INSERT INTO public.product_stats (product_id, date, clicks)
    VALUES (product_uuid, CURRENT_DATE, 1)
    ON CONFLICT (product_id, date)
    DO UPDATE SET clicks = product_stats.clicks + 1;

    -- Update partner total clicks
    UPDATE public.insurance_partners
    SET total_clicks = total_clicks + 1
    WHERE id = (SELECT partner_id FROM public.insurance_products WHERE id = product_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product conversion count
CREATE OR REPLACE FUNCTION increment_product_conversion(product_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Update product conversion count
    UPDATE public.insurance_products
    SET conversion_count = conversion_count + 1
    WHERE id = product_uuid;

    -- Update daily stats
    INSERT INTO public.product_stats (product_id, date, conversions)
    VALUES (product_uuid, CURRENT_DATE, 1)
    ON CONFLICT (product_id, date)
    DO UPDATE SET conversions = product_stats.conversions + 1;

    -- Update partner total conversions
    UPDATE public.insurance_partners
    SET total_conversions = total_conversions + 1
    WHERE id = (SELECT partner_id FROM public.insurance_products WHERE id = product_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
