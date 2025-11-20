import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  data_source_id: string;
  external_id: string;
  insurer_name: string;
  product_name: string;
  policy_type: 'health' | 'auto' | 'life' | 'home' | 'travel' | 'pet' | 'business' | 'other';
  premium_amount: number | null;
  premium_frequency: string | null;
  currency: string;
  coverage_summary: string | null;
  coverage_limits: any;
  benefits: string[];
  exclusions: string[];
  add_ons: any;
  product_url: string | null;
  document_url: string | null;
  contact_info: any;
  availability_regions: string[];
  ai_summary: string | null;
  ai_normalized_data: any;
  risk_score: number | null;
  status: 'active' | 'inactive' | 'outdated' | 'archived';
  is_duplicate: boolean;
  duplicate_of: string | null;
  last_verified_at: string | null;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  policy_type?: string[];
  insurer_name?: string[];
  min_premium?: number;
  max_premium?: number;
  status?: string;
  availability_region?: string;
  search_query?: string;
}

/**
 * Get all products with optional filters
 */
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase
    .from('product_catalog')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters) {
    if (filters.policy_type && filters.policy_type.length > 0) {
      query = query.in('policy_type', filters.policy_type);
    }

    if (filters.insurer_name && filters.insurer_name.length > 0) {
      query = query.in('insurer_name', filters.insurer_name);
    }

    if (filters.min_premium !== undefined) {
      query = query.gte('premium_amount', filters.min_premium);
    }

    if (filters.max_premium !== undefined) {
      query = query.lte('premium_amount', filters.max_premium);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.availability_region) {
      query = query.contains('availability_regions', [filters.availability_region]);
    }

    if (filters.search_query) {
      query = query.or(
        `product_name.ilike.%${filters.search_query}%,insurer_name.ilike.%${filters.search_query}%,coverage_summary.ilike.%${filters.search_query}%`
      );
    }
  }

  const { data, error } = await query.limit(100);

  if (error) throw error;
  return data || [];
}

/**
 * Get a specific product by ID
 */
export async function getProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get product with its data source information
 */
export async function getProductWithSource(id: string): Promise<any> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select(`
      *,
      data_sources (
        name,
        source_type,
        provider_name
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get product version history
 */
export async function getProductVersions(productId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('product_versions')
    .select('*')
    .eq('product_id', productId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Compare multiple products
 */
export async function compareProducts(productIds: string[]): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*')
    .in('id', productIds);

  if (error) throw error;
  return data || [];
}

/**
 * Get unique insurers from product catalog
 */
export async function getInsurersList(): Promise<string[]> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select('insurer_name')
    .eq('status', 'active');

  if (error) throw error;

  const insurers = [...new Set(data?.map((p: any) => p.insurer_name) || [])];
  return insurers.sort();
}

/**
 * Get products by insurer
 */
export async function getProductsByInsurer(insurerName: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*')
    .eq('insurer_name', insurerName)
    .eq('status', 'active')
    .order('premium_amount', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get products by policy type
 */
export async function getProductsByType(policyType: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*')
    .eq('policy_type', policyType)
    .eq('status', 'active')
    .order('premium_amount', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*')
    .or(
      `product_name.ilike.%${query}%,insurer_name.ilike.%${query}%,coverage_summary.ilike.%${query}%`
    )
    .eq('status', 'active')
    .limit(50);

  if (error) throw error;
  return data || [];
}

/**
 * Get recommended products based on user's existing policies
 */
export async function getRecommendedProducts(userId: string): Promise<Product[]> {
  // Get user's existing policies
  const { data: userPolicies } = await supabase
    .from('policies')
    .select('policy_type, premium_amount')
    .eq('user_id', userId);

  if (!userPolicies || userPolicies.length === 0) {
    // Return popular products if user has no policies
    return getPopularProducts();
  }

  // Get policy types user doesn't have
  const existingTypes = userPolicies.map((p: any) => p.policy_type);
  const allTypes = ['health', 'auto', 'life', 'home', 'travel', 'pet', 'business'];
  const missingTypes = allTypes.filter((type) => !existingTypes.includes(type));

  // Get products for missing types
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*')
    .in('policy_type', missingTypes)
    .eq('status', 'active')
    .order('risk_score', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Get popular products
 */
export async function getPopularProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('product_catalog')
    .select('*')
    .eq('status', 'active')
    .order('risk_score', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Get product statistics
 */
export async function getProductStatistics(): Promise<any> {
  const { data: products } = await supabase
    .from('product_catalog')
    .select('policy_type, status, premium_amount, insurer_name');

  if (!products) return null;

  const stats = {
    total: products.length,
    active: products.filter((p: any) => p.status === 'active').length,
    by_type: {} as any,
    by_insurer: {} as any,
    average_premium: 0,
  };

  // Count by type
  products.forEach((p: any) => {
    stats.by_type[p.policy_type] = (stats.by_type[p.policy_type] || 0) + 1;
  });

  // Count by insurer
  products.forEach((p: any) => {
    stats.by_insurer[p.insurer_name] = (stats.by_insurer[p.insurer_name] || 0) + 1;
  });

  // Calculate average premium
  const premiums = products
    .filter((p: any) => p.premium_amount && p.status === 'active')
    .map((p: any) => p.premium_amount);

  if (premiums.length > 0) {
    stats.average_premium = premiums.reduce((a: number, b: number) => a + b, 0) / premiums.length;
  }

  return stats;
}

/**
 * Update product status
 */
export async function updateProductStatus(
  productId: string,
  status: 'active' | 'inactive' | 'outdated' | 'archived'
): Promise<void> {
  const { error } = await supabase
    .from('product_catalog')
    .update({ status })
    .eq('id', productId);

  if (error) throw error;
}

/**
 * Archive old products
 */
export async function archiveOldProducts(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('product_catalog')
    .update({ status: 'archived' })
    .lt('last_verified_at', cutoffDate.toISOString())
    .eq('status', 'active')
    .select();

  if (error) throw error;
  return data?.length || 0;
}
