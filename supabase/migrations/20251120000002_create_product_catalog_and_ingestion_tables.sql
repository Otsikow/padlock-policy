-- ============================================================================
-- Product Catalog and Data Ingestion Tables
-- Created: 2025-11-20
-- Purpose: Add missing tables for product catalog and data ingestion features
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE product_status_catalog_enum AS ENUM ('active', 'inactive', 'outdated', 'archived');
CREATE TYPE data_source_type_enum AS ENUM ('api', 'aggregator', 'regulator', 'feed', 'scraper');
CREATE TYPE data_source_status_enum AS ENUM ('active', 'paused', 'error', 'disabled');
CREATE TYPE ingestion_job_status_enum AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE ingestion_job_type_enum AS ENUM ('scheduled', 'manual', 'webhook');
CREATE TYPE log_level_enum AS ENUM ('info', 'warning', 'error', 'debug');
CREATE TYPE alert_status_enum AS ENUM ('active', 'acknowledged', 'resolved', 'ignored');
CREATE TYPE alert_severity_enum AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE duplicate_detection_status_enum AS ENUM ('pending', 'confirmed', 'false_positive', 'ignored');

-- ============================================================================
-- DATA SOURCES TABLE
-- ============================================================================

CREATE TABLE public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_type data_source_type_enum NOT NULL,
    provider_name TEXT NOT NULL,
    status data_source_status_enum DEFAULT 'active',
    configuration JSONB DEFAULT '{}'::jsonb,
    sync_frequency TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRODUCT CATALOG TABLE
-- ============================================================================

CREATE TABLE public.product_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    external_id TEXT,
    insurer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    policy_type policy_type_enum NOT NULL,
    premium_amount DECIMAL(10,2),
    premium_frequency TEXT,
    currency TEXT DEFAULT 'USD',
    coverage_summary TEXT,
    coverage_limits JSONB DEFAULT '{}'::jsonb,
    benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    exclusions TEXT[] DEFAULT ARRAY[]::TEXT[],
    add_ons JSONB DEFAULT '{}'::jsonb,
    product_url TEXT,
    document_url TEXT,
    contact_info JSONB DEFAULT '{}'::jsonb,
    availability_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_summary TEXT,
    ai_normalized_data JSONB DEFAULT '{}'::jsonb,
    risk_score DECIMAL(5,2),
    status product_status_catalog_enum DEFAULT 'active',
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of UUID REFERENCES public.product_catalog(id) ON DELETE SET NULL,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(data_source_id, external_id)
);

-- Index for performance
CREATE INDEX idx_product_catalog_insurer ON public.product_catalog(insurer_name);
CREATE INDEX idx_product_catalog_policy_type ON public.product_catalog(policy_type);
CREATE INDEX idx_product_catalog_status ON public.product_catalog(status);
CREATE INDEX idx_product_catalog_data_source ON public.product_catalog(data_source_id);

-- ============================================================================
-- PRODUCT VERSIONS TABLE
-- ============================================================================

CREATE TABLE public.product_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    snapshot_data JSONB NOT NULL,
    changes JSONB,
    changed_by TEXT,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique version numbers per product
    UNIQUE(product_id, version_number)
);

CREATE INDEX idx_product_versions_product_id ON public.product_versions(product_id);

-- ============================================================================
-- INGESTION JOBS TABLE
-- ============================================================================

CREATE TABLE public.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE NOT NULL,
    status ingestion_job_status_enum DEFAULT 'pending',
    job_type ingestion_job_type_enum DEFAULT 'manual',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    products_found INTEGER DEFAULT 0,
    products_new INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    products_duplicates INTEGER DEFAULT 0,
    products_errors INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ingestion_jobs_data_source ON public.ingestion_jobs(data_source_id);
CREATE INDEX idx_ingestion_jobs_status ON public.ingestion_jobs(status);

-- ============================================================================
-- INGESTION LOGS TABLE
-- ============================================================================

CREATE TABLE public.ingestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.ingestion_jobs(id) ON DELETE CASCADE NOT NULL,
    log_level log_level_enum DEFAULT 'info',
    message TEXT NOT NULL,
    product_id UUID REFERENCES public.product_catalog(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ingestion_logs_job_id ON public.ingestion_logs(job_id);
CREATE INDEX idx_ingestion_logs_level ON public.ingestion_logs(log_level);

-- ============================================================================
-- CONSISTENCY ALERTS TABLE
-- ============================================================================

CREATE TABLE public.consistency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
    alert_type TEXT NOT NULL,
    severity alert_severity_enum DEFAULT 'medium',
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status alert_status_enum DEFAULT 'active',
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consistency_alerts_product_id ON public.consistency_alerts(product_id);
CREATE INDEX idx_consistency_alerts_status ON public.consistency_alerts(status);
CREATE INDEX idx_consistency_alerts_severity ON public.consistency_alerts(severity);

-- ============================================================================
-- DUPLICATE DETECTIONS TABLE
-- ============================================================================

CREATE TABLE public.duplicate_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
    duplicate_product_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE NOT NULL,
    similarity_score DECIMAL(5,2) NOT NULL,
    matching_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    status duplicate_detection_status_enum DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate pairs
    CHECK (product_id != duplicate_product_id),
    UNIQUE(product_id, duplicate_product_id)
);

CREATE INDEX idx_duplicate_detections_product_id ON public.duplicate_detections(product_id);
CREATE INDEX idx_duplicate_detections_status ON public.duplicate_detections(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consistency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_sources (admin and insurance company access)
CREATE POLICY "Insurance companies and admins can view data sources"
    ON public.data_sources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role IN ('admin', 'insurance_company', 'partner')
        )
    );

CREATE POLICY "Admins can insert data sources"
    ON public.data_sources FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role = 'admin'
        )
    );

CREATE POLICY "Admins can update data sources"
    ON public.data_sources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role = 'admin'
        )
    );

-- RLS Policies for product_catalog (public read, admin write)
CREATE POLICY "Anyone can view active products"
    ON public.product_catalog FOR SELECT
    USING (status = 'active' OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND user_role IN ('admin', 'insurance_company', 'partner')
    ));

CREATE POLICY "Admins and partners can insert products"
    ON public.product_catalog FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role IN ('admin', 'partner')
        )
    );

CREATE POLICY "Admins and partners can update products"
    ON public.product_catalog FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role IN ('admin', 'partner')
        )
    );

-- RLS Policies for product_versions (public read for active products)
CREATE POLICY "Users can view product versions"
    ON public.product_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.product_catalog
            WHERE id = product_versions.product_id
            AND (status = 'active' OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND user_role IN ('admin', 'partner')
            ))
        )
    );

-- RLS Policies for ingestion_jobs (admin only)
CREATE POLICY "Admins and partners can view ingestion jobs"
    ON public.ingestion_jobs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role IN ('admin', 'partner')
        )
    );

-- RLS Policies for ingestion_logs (admin only)
CREATE POLICY "Admins and partners can view ingestion logs"
    ON public.ingestion_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role IN ('admin', 'partner')
        )
    );

-- RLS Policies for consistency_alerts (admin only)
CREATE POLICY "Admins can view consistency alerts"
    ON public.consistency_alerts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role = 'admin'
        )
    );

CREATE POLICY "Admins can update consistency alerts"
    ON public.consistency_alerts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role = 'admin'
        )
    );

-- RLS Policies for duplicate_detections (admin only)
CREATE POLICY "Admins can view duplicate detections"
    ON public.duplicate_detections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role = 'admin'
        )
    );

CREATE POLICY "Admins can update duplicate detections"
    ON public.duplicate_detections FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND user_role = 'admin'
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp trigger for data_sources
CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON public.data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp trigger for product_catalog
CREATE TRIGGER update_product_catalog_updated_at
    BEFORE UPDATE ON public.product_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp trigger for consistency_alerts
CREATE TRIGGER update_consistency_alerts_updated_at
    BEFORE UPDATE ON public.consistency_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp trigger for duplicate_detections
CREATE TRIGGER update_duplicate_detections_updated_at
    BEFORE UPDATE ON public.duplicate_detections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.data_sources IS 'Stores data source configurations for automated product ingestion';
COMMENT ON TABLE public.product_catalog IS 'Main product catalog with insurance products from various sources';
COMMENT ON TABLE public.product_versions IS 'Version history for tracking changes to products';
COMMENT ON TABLE public.ingestion_jobs IS 'Tracks data ingestion jobs and their statistics';
COMMENT ON TABLE public.ingestion_logs IS 'Detailed logs for ingestion job execution';
COMMENT ON TABLE public.consistency_alerts IS 'Alerts for data quality and consistency issues';
COMMENT ON TABLE public.duplicate_detections IS 'Tracks detected duplicate products for review';
