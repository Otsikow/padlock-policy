import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Package,
  Bot,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { CompanyManagement } from '@/components/admin/CompanyManagement';
import { ProductManagement } from '@/components/admin/ProductManagement';
import { AIOperations } from '@/components/admin/AIOperations';
import { Analytics } from '@/components/admin/Analytics';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalCompanies: number;
  pendingVerifications: number;
  newProductSubmissions: number;
  aiAlerts: number;
  totalSearches: number;
  approvedCompanies: number;
  activeProducts: number;
  runningCrawls: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCompanies: 0,
    pendingVerifications: 0,
    newProductSubmissions: 0,
    aiAlerts: 0,
    totalSearches: 0,
    approvedCompanies: 0,
    activeProducts: 0,
    runningCrawls: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      // Fetch all metrics in parallel
      const [
        companiesResult,
        pendingCompaniesResult,
        approvedCompaniesResult,
        pendingProductsResult,
        activeProductsResult,
        crawlLogsResult,
        runningCrawlsResult,
        searchQueriesResult,
      ] = await Promise.all([
        supabase.from('insurance_companies').select('id', { count: 'exact', head: true }),
        supabase.from('insurance_companies').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('insurance_companies').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('ai_crawl_logs').select('id', { count: 'exact', head: true }),
        supabase.from('ai_crawl_logs').select('id', { count: 'exact', head: true }).eq('status', 'running'),
        supabase.from('search_queries').select('id', { count: 'exact', head: true }),
      ]);

      // Count AI alerts (products with risk flags)
      const { data: productsWithAlerts } = await supabase
        .from('products')
        .select('ai_risk_flags')
        .not('ai_risk_flags', 'eq', '[]');

      const aiAlertCount = productsWithAlerts?.length || 0;

      setMetrics({
        totalCompanies: companiesResult.count || 0,
        pendingVerifications: pendingCompaniesResult.count || 0,
        newProductSubmissions: pendingProductsResult.count || 0,
        aiAlerts: aiAlertCount,
        totalSearches: searchQueriesResult.count || 0,
        approvedCompanies: approvedCompaniesResult.count || 0,
        activeProducts: activeProductsResult.count || 0,
        runningCrawls: runningCrawlsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = () => {
    fetchDashboardMetrics();
    toast({
      title: 'Refreshed',
      description: 'Dashboard metrics have been updated',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Control Panel
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage companies, products, and AI operations
                </p>
              </div>
            </div>
            <Button onClick={refreshMetrics} variant="outline">
              Refresh Metrics
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insurance Companies</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalCompanies}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.approvedCompanies} approved
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-3xl font-bold mt-2">{metrics.pendingVerifications}</p>
                <p className="text-sm text-gray-500 mt-1">Require action</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Product Submissions</p>
                <p className="text-3xl font-bold mt-2">{metrics.newProductSubmissions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.activeProducts} active
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Alerts</p>
                <p className="text-3xl font-bold mt-2">{metrics.aiAlerts}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.runningCrawls} crawls running
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold">{metrics.totalSearches}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Approved Products</p>
                <p className="text-2xl font-bold">{metrics.activeProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">AI Operations</p>
                <p className="text-2xl font-bold">{metrics.runningCrawls} active</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Operations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <CompanyManagement onUpdate={refreshMetrics} />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductManagement onUpdate={refreshMetrics} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AIOperations onUpdate={refreshMetrics} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
