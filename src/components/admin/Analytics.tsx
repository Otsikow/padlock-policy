import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Users,
  Package,
  Search,
  MapPin,
  Building2,
  Eye,
  MousePointerClick,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  totalSearches: number;
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
    clicks: number;
    conversions: number;
  }>;
  topCompanies: Array<{
    id: string;
    name: string;
    productCount: number;
    totalViews: number;
  }>;
  searchTrends: Array<{
    query: string;
    count: number;
  }>;
  insuranceTypeBreakdown: Array<{
    type: string;
    count: number;
  }>;
  regionalData: Array<{
    country: string;
    searches: number;
  }>;
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalSearches: 0,
    topProducts: [],
    topCompanies: [],
    searchTrends: [],
    insuranceTypeBreakdown: [],
    regionalData: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getDateFilter = () => {
    const now = new Date();
    const ranges: Record<string, Date> = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      'all': new Date(0),
    };
    return ranges[timeRange] || ranges['7d'];
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const dateFilter = getDateFilter();

      // Fetch products with stats
      const { data: products } = await supabase
        .from('products')
        .select('id, product_name, view_count, click_count, conversion_count, created_at')
        .gte('created_at', dateFilter.toISOString())
        .order('view_count', { ascending: false })
        .limit(10);

      // Calculate total metrics
      const { data: allProducts } = await supabase
        .from('products')
        .select('view_count, click_count, conversion_count');

      const totalViews = allProducts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      const totalClicks = allProducts?.reduce((sum, p) => sum + (p.click_count || 0), 0) || 0;
      const totalConversions = allProducts?.reduce((sum, p) => sum + (p.conversion_count || 0), 0) || 0;

      // Fetch search queries
      const { data: searches, count: searchCount } = await supabase
        .from('search_queries')
        .select('query_text, insurance_type, user_country', { count: 'exact' })
        .gte('created_at', dateFilter.toISOString());

      // Aggregate search trends
      const searchTrendsMap = new Map<string, number>();
      searches?.forEach((s) => {
        const count = searchTrendsMap.get(s.query_text) || 0;
        searchTrendsMap.set(s.query_text, count + 1);
      });

      const searchTrends = Array.from(searchTrendsMap.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Insurance type breakdown
      const typeBreakdownMap = new Map<string, number>();
      searches?.forEach((s) => {
        if (s.insurance_type) {
          const count = typeBreakdownMap.get(s.insurance_type) || 0;
          typeBreakdownMap.set(s.insurance_type, count + 1);
        }
      });

      const insuranceTypeBreakdown = Array.from(typeBreakdownMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Regional data
      const regionalMap = new Map<string, number>();
      searches?.forEach((s) => {
        if (s.user_country) {
          const count = regionalMap.get(s.user_country) || 0;
          regionalMap.set(s.user_country, count + 1);
        }
      });

      const regionalData = Array.from(regionalMap.entries())
        .map(([country, searches]) => ({ country, searches }))
        .sort((a, b) => b.searches - a.searches)
        .slice(0, 5);

      // Fetch companies with product counts
      const { data: companies } = await supabase.from('insurance_companies').select(`
        id,
        company_name,
        products:products(id, view_count)
      `);

      const topCompanies = companies
        ?.map((c: any) => ({
          id: c.id,
          name: c.company_name,
          productCount: c.products?.length || 0,
          totalViews: c.products?.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0) || 0,
        }))
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 5) || [];

      setAnalytics({
        totalViews,
        totalClicks,
        totalConversions,
        totalSearches: searchCount || 0,
        topProducts:
          products?.map((p) => ({
            id: p.id,
            name: p.product_name,
            views: p.view_count || 0,
            clicks: p.click_count || 0,
            conversions: p.conversion_count || 0,
          })) || [],
        topCompanies,
        searchTrends,
        insuranceTypeBreakdown,
        regionalData,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = () => {
    if (analytics.totalClicks === 0) return 0;
    return ((analytics.totalConversions / analytics.totalClicks) * 100).toFixed(2);
  };

  const calculateCTR = () => {
    if (analytics.totalViews === 0) return 0;
    return ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Track performance, user behaviour, and market trends
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalytics} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Views</p>
          </div>
          <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MousePointerClick className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Clicks</p>
          </div>
          <p className="text-3xl font-bold">{analytics.totalClicks.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{calculateCTR()}% CTR</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Conversions</p>
          </div>
          <p className="text-3xl font-bold">{analytics.totalConversions.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{calculateConversionRate()}% rate</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Search className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Searches</p>
          </div>
          <p className="text-3xl font-bold">{analytics.totalSearches.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Products</p>
          </div>
          <p className="text-3xl font-bold">{analytics.topProducts.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top Performing Products
          </h3>
          {analytics.topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No product data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full text-purple-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex gap-3 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {product.clicks}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {product.conversions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Performing Companies */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top Performing Insurers
          </h3>
          {analytics.topCompanies.length === 0 ? (
            <p className="text-gray-500 text-sm">No company data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.topCompanies.map((company, index) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{company.name}</p>
                      <p className="text-xs text-gray-600">
                        {company.productCount} products · {company.totalViews.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Top Search Queries
          </h3>
          {analytics.searchTrends.length === 0 ? (
            <p className="text-gray-500 text-sm">No search data available</p>
          ) : (
            <div className="space-y-2">
              {analytics.searchTrends.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium">{trend.query}</span>
                  <span className="text-sm text-gray-600 font-mono">{trend.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Insurance Type Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Insurance Type Breakdown
          </h3>
          {analytics.insuranceTypeBreakdown.length === 0 ? (
            <p className="text-gray-500 text-sm">No type data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.insuranceTypeBreakdown.map((type) => {
                const total = analytics.insuranceTypeBreakdown.reduce(
                  (sum, t) => sum + t.count,
                  0
                );
                const percentage = ((type.count / total) * 100).toFixed(1);
                return (
                  <div key={type.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{type.type}</span>
                      <span className="text-sm text-gray-600">
                        {type.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Regional Data */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Regions with Highest Demand
        </h3>
        {analytics.regionalData.length === 0 ? (
          <p className="text-gray-500 text-sm">No regional data available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {analytics.regionalData.map((region, index) => (
              <Card key={region.country} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full text-indigo-600 font-bold text-xs">
                    {index + 1}
                  </div>
                  <p className="font-medium text-sm">{region.country}</p>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {region.searches.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">searches</p>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
