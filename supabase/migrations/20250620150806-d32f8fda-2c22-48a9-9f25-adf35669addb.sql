
-- Create enum types for better data consistency
CREATE TYPE policy_type_enum AS ENUM ('health', 'auto', 'life', 'home', 'other');
CREATE TYPE claim_status_enum AS ENUM ('pending', 'approved', 'rejected', 'processing');
CREATE TYPE document_type_enum AS ENUM ('policy', 'receipt', 'id', 'claim', 'other');
CREATE TYPE notification_status_enum AS ENUM ('read', 'unread');

-- Create Policies Table
CREATE TABLE public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_url TEXT,
    policy_type policy_type_enum NOT NULL,
    premium_amount DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Claims Table
CREATE TABLE public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE NOT NULL,
    claim_status claim_status_enum DEFAULT 'pending',
    claim_reason TEXT NOT NULL,
    claim_documents TEXT, -- Store file URLs as JSON array or comma-separated
    claim_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Comparison Offers Table
CREATE TABLE public.comparison_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insurer_name TEXT NOT NULL,
    coverage_details TEXT,
    premium_amount DECIMAL(10,2) NOT NULL,
    benefits TEXT,
    contact_info TEXT,
    policy_type policy_type_enum,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status notification_status_enum DEFAULT 'unread'
);

-- Create Documents Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    document_type document_type_enum NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Policies Table
CREATE POLICY "Users can view their own policies" ON public.policies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policies" ON public.policies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies" ON public.policies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies" ON public.policies
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Claims Table
CREATE POLICY "Users can view their own claims" ON public.claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims" ON public.claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" ON public.claims
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Comparison Offers Table (public read access)
CREATE POLICY "Anyone can view comparison offers" ON public.comparison_offers
    FOR SELECT USING (true);

-- RLS Policies for Notifications Table
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Documents Table
CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
