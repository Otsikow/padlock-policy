import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { StatsCard } from "@/components/partner/StatsCard";
import { ProductCard } from "@/components/partner/ProductCard";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BottomNav } from "@/components/BottomNav";
import {
  Package,
  Eye,
  MousePointerClick,
  CheckCircle,
  Plus,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type InsurancePartner = Tables<"insurance_partners">;
type InsuranceProduct = Tables<"insurance_products">;

const PartnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partnerData, setPartnerData] = useState<InsurancePartner | null>(null);
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    liveProducts: 0,
    pendingApprovals: 0,
    totalViews: 0,
    totalClicks: 0,
    totalConversions: 0,
    averageQualityScore: 0,
  });

  useEffect(() => {
    if (user) {
      fetchPartnerData();
    }
  }, [user]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);

      // Fetch partner profile
      const { data: partner, error: partnerError } = await supabase
        .from("insurance_partners")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (partnerError) {
        if (partnerError.code === "PGRST116") {
          // No partner profile exists, redirect to setup
          navigate("/partner/setup");
          return;
        }
        throw partnerError;
      }

      setPartnerData(partner);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("insurance_products")
        .select("*")
        .eq("partner_id", partner.id)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      setProducts(productsData || []);

      // Calculate stats
      const liveProducts = productsData?.filter((p) => p.status === "active").length || 0;
      const pendingProducts =
        productsData?.filter((p) => p.status === "pending_review").length || 0;

      const qualityScores = productsData
        ?.map((p) => p.ai_quality_score)
        .filter((score): score is number => score !== null && score > 0) || [];
      const averageQualityScore =
        qualityScores.length > 0
          ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
          : 0;

      setStats({
        totalProducts: productsData?.length || 0,
        liveProducts,
        pendingApprovals: pendingProducts,
        totalViews: partner.total_views || 0,
        totalClicks: partner.total_clicks || 0,
        totalConversions: partner.total_conversions || 0,
        averageQualityScore,
      });
    } catch (error: any) {
      console.error("Error fetching partner data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/partner/products/${productId}/edit`);
  };

  const handleViewStats = (productId: string) => {
    navigate(`/partner/products/${productId}/stats`);
  };

  const handleChangeStatus = async (productId: string, newStatus: InsuranceProduct["status"]) => {
    try {
      const { error } = await supabase
        .from("insurance_products")
        .update({ status: newStatus })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product status updated successfully",
      });

      fetchPartnerData();
    } catch (error: any) {
      console.error("Error updating product status:", error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("insurance_products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchPartnerData();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Package className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Welcome back, {partnerData?.company_name}
            </p>
          </div>
          <Button
            onClick={() => navigate("/partner/products/create")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            description={`${stats.liveProducts} active`}
          />
          <StatsCard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={Eye}
          />
          <StatsCard
            title="Total Clicks"
            value={stats.totalClicks.toLocaleString()}
            icon={MousePointerClick}
          />
          <StatsCard
            title="Conversions"
            value={stats.totalConversions.toLocaleString()}
            icon={CheckCircle}
          />
        </div>

        {/* Additional Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            description="Products awaiting review"
          />
          <StatsCard
            title="AI Quality Score"
            value={stats.averageQualityScore > 0 ? stats.averageQualityScore.toFixed(1) : "N/A"}
            icon={Star}
            description="Average across products"
          />
          <StatsCard
            title="Conversion Rate"
            value={
              stats.totalClicks > 0
                ? `${((stats.totalConversions / stats.totalClicks) * 100).toFixed(1)}%`
                : "0%"
            }
            icon={TrendingUp}
          />
        </div>

        {/* Products Section */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
            <Button variant="outline" onClick={() => navigate("/partner/products")}>
              View All
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {products.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No products yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Get started by creating your first insurance product.
                  </p>
                  <Button
                    onClick={() => navigate("/partner/products/create")}
                    className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onViewStats={handleViewStats}
                      onChangeStatus={handleChangeStatus}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products
                  .filter((p) => p.status === "active")
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onViewStats={handleViewStats}
                      onChangeStatus={handleChangeStatus}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="draft">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products
                  .filter((p) => p.status === "draft")
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onViewStats={handleViewStats}
                      onChangeStatus={handleChangeStatus}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products
                  .filter((p) => p.status === "pending_review")
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onViewStats={handleViewStats}
                      onChangeStatus={handleChangeStatus}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default PartnerDashboard;
