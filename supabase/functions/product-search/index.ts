import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductSearchRequest {
  // Search filters
  policy_type?: 'health' | 'auto' | 'life' | 'home' | 'other';
  company_id?: string;
  min_premium?: number;
  max_premium?: number;
  currency?: string;
  country?: string;
  age?: number;
  search_term?: string;

  // Pagination
  page?: number;
  per_page?: number;

  // Sorting
  sort_by?: 'premium_amount' | 'popularity_score' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request - support both GET and POST
    let searchParams: ProductSearchRequest = {};

    if (req.method === 'POST') {
      searchParams = await req.json();
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      searchParams = {
        policy_type: url.searchParams.get('policy_type') as any,
        company_id: url.searchParams.get('company_id') || undefined,
        min_premium: url.searchParams.get('min_premium') ? parseFloat(url.searchParams.get('min_premium')!) : undefined,
        max_premium: url.searchParams.get('max_premium') ? parseFloat(url.searchParams.get('max_premium')!) : undefined,
        currency: url.searchParams.get('currency') || undefined,
        country: url.searchParams.get('country') || undefined,
        age: url.searchParams.get('age') ? parseInt(url.searchParams.get('age')!) : undefined,
        search_term: url.searchParams.get('search_term') || undefined,
        page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1,
        per_page: url.searchParams.get('per_page') ? parseInt(url.searchParams.get('per_page')!) : 20,
        sort_by: url.searchParams.get('sort_by') as any || 'popularity_score',
        sort_order: url.searchParams.get('sort_order') as any || 'desc'
      };
    }

    // Default pagination
    const page = searchParams.page || 1;
    const perPage = Math.min(searchParams.per_page || 20, 100); // Max 100 per page
    const offset = (page - 1) * perPage;

    // Build query
    let query = supabase
      .from('insurance_products')
      .select('*, insurance_companies!inner(id, name, logo_url, website)', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (searchParams.policy_type) {
      query = query.eq('policy_type', searchParams.policy_type);
    }

    if (searchParams.company_id) {
      query = query.eq('company_id', searchParams.company_id);
    }

    if (searchParams.min_premium !== undefined) {
      query = query.gte('premium_amount', searchParams.min_premium);
    }

    if (searchParams.max_premium !== undefined) {
      query = query.lte('premium_amount', searchParams.max_premium);
    }

    if (searchParams.currency) {
      query = query.eq('currency', searchParams.currency);
    }

    if (searchParams.country) {
      query = query.contains('available_countries', [searchParams.country]);
    }

    if (searchParams.age !== undefined) {
      query = query
        .or(`minimum_age.is.null,minimum_age.lte.${searchParams.age}`)
        .or(`maximum_age.is.null,maximum_age.gte.${searchParams.age}`);
    }

    if (searchParams.search_term) {
      // Search in product name, description, and keywords
      const searchTerm = searchParams.search_term.toLowerCase();
      query = query.or(
        `product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,search_keywords.cs.{${searchTerm}}`
      );
    }

    // Apply sorting
    const sortBy = searchParams.sort_by || 'popularity_score';
    const sortOrder = searchParams.sort_order === 'asc' ? true : false;
    query = query.order(sortBy, { ascending: sortOrder });

    // Apply pagination
    query = query.range(offset, offset + perPage - 1);

    // Execute query
    const { data: products, error: searchError, count } = await query;

    if (searchError) {
      console.error('Error searching products:', searchError);
      return new Response(
        JSON.stringify({
          error: 'Failed to search products',
          details: searchError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / perPage);

    return new Response(
      JSON.stringify({
        success: true,
        products: products || [],
        pagination: {
          page,
          per_page: perPage,
          total_items: count || 0,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_previous: page > 1
        },
        filters_applied: searchParams
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in product-search function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
