-- ============================================================================
-- Storage Buckets for File Uploads
-- Created: 2025-11-20
-- Purpose: Create storage buckets for company documents and logos
-- ============================================================================

-- Note: avatars bucket already exists from earlier migration
-- Create company-documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-documents',
  'company-documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create company-logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true, -- Public access for logo display
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR COMPANY DOCUMENTS
-- ============================================================================

-- Insurance companies can view their own documents
CREATE POLICY "Insurance companies can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-documents'
    AND auth.uid() IN (
      SELECT user_id FROM public.insurance_companies
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- Admins can view all company documents
CREATE POLICY "Admins can view all company documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND user_role = 'admin'
    )
  );

-- Insurance companies can upload their own documents
CREATE POLICY "Insurance companies can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-documents'
    AND auth.uid() IN (
      SELECT user_id FROM public.insurance_companies
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- Insurance companies can update their own documents
CREATE POLICY "Insurance companies can update their own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-documents'
    AND auth.uid() IN (
      SELECT user_id FROM public.insurance_companies
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- Insurance companies can delete their own documents
CREATE POLICY "Insurance companies can delete their own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-documents'
    AND auth.uid() IN (
      SELECT user_id FROM public.insurance_companies
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- ============================================================================
-- STORAGE POLICIES FOR COMPANY LOGOS
-- ============================================================================

-- Company logos are publicly accessible
CREATE POLICY "Company logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

-- Insurance companies can upload their own logos
CREATE POLICY "Insurance companies can upload their own logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
      SELECT user_id FROM public.insurance_companies
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- Insurance companies can update their own logos
CREATE POLICY "Insurance companies can update their own logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
      SELECT user_id FROM public.insurance_companies
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- Insurance companies can delete their own logos
CREATE POLICY "Insurance companies can delete their own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid() IN (
      SELECT user_id FROM public.insurance_companies
      WHERE id::text = (storage.foldername(name))[1]
    )
  );
