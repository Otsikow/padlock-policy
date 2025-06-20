
-- Add status column to policies table
ALTER TABLE public.policies ADD COLUMN status TEXT DEFAULT 'active';

-- Add check constraint to ensure valid status values
ALTER TABLE public.policies ADD CONSTRAINT policies_status_check 
CHECK (status IN ('active', 'cancelled', 'expired'));

-- Update existing policies to have 'active' status
UPDATE public.policies SET status = 'active' WHERE status IS NULL;
