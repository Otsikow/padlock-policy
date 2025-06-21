
-- Add country column to profiles table to store user's registered country
ALTER TABLE public.profiles 
ADD COLUMN country TEXT DEFAULT 'GB';

-- Add a comment to document the country field
COMMENT ON COLUMN public.profiles.country IS 'ISO 3166-1 alpha-2 country code (e.g., GB, US, CA, GH, NG)';
