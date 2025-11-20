import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Zap, Clock, Heart, AlertCircle, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import MarketplaceFilters from '@/components/MarketplaceFilters';
import AISearchAssistant from '@/components/AISearchAssistant';
import { MarketplaceProduct, MarketplaceFilters as Filters } from '@/types/marketplace';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from '@/hooks/use-toast';

const Marketplace = () => {
  const { formatAmount } = useCurrency();
  const [filters, setFilters] = useState<Filters>({});
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Mock data for demonstration - in production this would come from Supabase
  const mockProducts: MarketplaceProduct[] = [
    {
      id: '1',
      product_name: 'Comprehensive Car Cover',
      insurer_name: 'AutoGuard Pro',
      policy_type: 'auto',
      monthly_premium: 45.99,
      annual_premium: 499.99,
      coverage_amount: 500000,
      coverage_summary: 'Full comprehensive cover with breakdown assistance',
      region: 'London',
      min_age: 25,
      max_age: 70,
      extra_benefits: ['Breakdown Cover', 'Legal Cover', 'Courtesy Car', 'Windscreen Cover'],
      company_rating: 4.8,
      instant_issue: true,
      requires_medical_exam: false,
      covers_pre_existing_conditions: false,
      covers_high_risk_jobs: false,
      description: 'Award-winning comprehensive car insurance with excellent customer service and fast claims processing.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      product_name: 'Elite Health Plan',
      insurer_name: 'HealthFirst Elite',
      policy_type: 'health',
      monthly_premium: 189.99,
      annual_premium: 2099.99,
      coverage_amount: 2000000,
      coverage_summary: 'Premium health insurance with extensive coverage',
      region: 'UK-wide',
      min_age: 18,
      max_age: 65,
      extra_benefits: ['24/7 Support', 'Dental Cover', 'Optical Cover', 'Mental Health Support', 'Physiotherapy'],
      company_rating: 4.9,
      instant_issue: false,
      requires_medical_exam: true,
      covers_pre_existing_conditions: true,
      covers_high_risk_jobs: false,
      description: 'Comprehensive health insurance including dental, optical, and mental health support.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      product_name: 'Essential Life Protection',
      insurer_name: 'LifeShield Plus',
      policy_type: 'life',
      monthly_premium: 24.99,
      annual_premium: 279.99,
      coverage_amount: 250000,
      coverage_summary: 'Affordable life insurance with flexible terms',
      region: 'UK-wide',
      min_age: 18,
      max_age: 75,
      extra_benefits: ['Critical Illness', 'Income Protection', 'No Medical Exam'],
      company_rating: 4.7,
      instant_issue: true,
      requires_medical_exam: false,
      covers_pre_existing_conditions: false,
      covers_high_risk_jobs: false,
      description: 'Simple and affordable life insurance with no medical exam required for qualifying applicants.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      product_name: 'Premium Home Shield',
      insurer_name: 'HomeGuard Elite',
      policy_type: 'home',
      monthly_premium: 34.99,
      annual_premium: 389.99,
      coverage_amount: 500000,
      coverage_summary: 'Complete home and contents insurance',
      region: 'UK-wide',
      extra_benefits: ['Home Emergency', 'Legal Cover', 'Personal Accident Cover'],
      company_rating: 4.6,
      instant_issue: true,
      requires_medical_exam: false,
      covers_pre_existing_conditions: false,
      covers_high_risk_jobs: false,
      description: 'Comprehensive home insurance covering buildings, contents, and personal belongings.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      product_name: 'Young Driver Auto',
      insurer_name: 'AutoGuard Pro',
      policy_type: 'auto',
      monthly_premium: 89.99,
      annual_premium: 999.99,
      coverage_amount: 300000,
      coverage_summary: 'Specialised insurance for young drivers',
      region: 'London',
      min_age: 17,
      max_age: 25,
      extra_benefits: ['Breakdown Cover', 'Key Cover', 'Personal Accident Cover'],
      company_rating: 4.5,
      instant_issue: true,
      requires_medical_exam: false,
      covers_pre_existing_conditions: false,
      covers_high_risk_jobs: false,
      description: 'Tailored car insurance for young and new drivers with competitive premiums.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      product_name: 'Professional Health Plus',
      insurer_name: 'SecureLife Insurance',
      policy_type: 'health',
      monthly_premium: 145.00,
      annual_premium: 1599.99,
      coverage_amount: 1500000,
      coverage_summary: 'Health insurance for professionals',
      region: 'UK-wide',
      min_age: 25,
      max_age: 60,
      extra_benefits: ['24/7 Support', 'Mental Health Support', 'Physiotherapy'],
      company_rating: 4.8,
      instant_issue: true,
      requires_medical_exam: false,
      covers_pre_existing_conditions: true,
      covers_high_risk_jobs: true,
      description: 'Designed for professionals, including coverage for high-risk occupations.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockProducts];

      // Apply filters
      if (filters.policy_type) {
        filtered = filtered.filter(p => p.policy_type === filters.policy_type);
      }

      if (filters.min_premium !== undefined) {
        filtered = filtered.filter(p => p.monthly_premium >= filters.min_premium!);
      }

      if (filters.max_premium !== undefined) {
        filtered = filtered.filter(p => p.monthly_premium <= filters.max_premium!);
      }

      if (filters.min_coverage !== undefined) {
        filtered = filtered.filter(p => p.coverage_amount >= filters.min_coverage!);
      }

      if (filters.max_coverage !== undefined) {
        filtered = filtered.filter(p => p.coverage_amount <= filters.max_coverage!);
      }

      if (filters.region) {
        filtered = filtered.filter(p => p.region === filters.region || p.region === 'UK-wide');
      }

      if (filters.age !== undefined) {
        filtered = filtered.filter(p => {
          const meetsMinAge = p.min_age === undefined || filters.age! >= p.min_age;
          const meetsMaxAge = p.max_age === undefined || filters.age! <= p.max_age;
          return meetsMinAge && meetsMaxAge;
        });
      }

      if (filters.min_rating !== undefined) {
        filtered = filtered.filter(p => p.company_rating >= filters.min_rating!);
      }

      if (filters.instant_issue_only) {
        filtered = filtered.filter(p => p.instant_issue === true);
      }

      if (filters.covers_pre_existing) {
        filtered = filtered.filter(p => p.covers_pre_existing_conditions === true);
      }

      if (filters.covers_high_risk_jobs) {
        filtered = filtered.filter(p => p.covers_high_risk_jobs === true);
      }

      if (filters.extra_benefits && filters.extra_benefits.length > 0) {
        filtered = filtered.filter(p => {
          return filters.extra_benefits!.some(benefit =>
            p.extra_benefits?.includes(benefit)
          );
        });
      }

      setProducts(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    toast({
      title: 'Filters reset',
      description: 'Showing all available products',
    });
  };

  const handleAISearch = (aiFilters: Filters) => {
    setFilters(aiFilters);
    toast({
      title: 'AI Search Applied',
      description: 'Showing products matching your query',
    });
  };

  const handleGetQuote = (product: MarketplaceProduct) => {
    toast({
      title: 'Quote Request',
      description: `Getting quote for ${product.product_name} from ${product.insurer_name}`,
    });
    setSelectedProduct(product.id);
  };

  const getPolicyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      health: 'Health',
      auto: 'Car',
      life: 'Life',
      home: 'Home',
      other: 'Other',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white p-6 rounded-b-3xl shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold drop-shadow-lg">Insurance Marketplace</h1>
              <p className="text-white/90 drop-shadow-sm">Compare and find the perfect insurance for you</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl border border-white/20">
              <img
                src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png"
                alt="Padlock Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-xs text-white/80">Products Found</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-xs text-white/80">Insurers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="text-2xl font-bold">4.7★</div>
              <div className="text-xs text-white/80">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* AI Search Assistant */}
        <div className="mb-6">
          <AISearchAssistant onSearch={handleAISearch} />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <MarketplaceFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <Card className="text-center py-20">
                <CardContent>
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button onClick={handleResetFilters} variant="outline">
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-purple-100 text-purple-700 border-0">
                              {getPolicyTypeLabel(product.policy_type)}
                            </Badge>
                            {product.instant_issue && (
                              <Badge className="bg-green-100 text-green-700 border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                Instant Issue
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl mb-1">{product.product_name}</CardTitle>
                          <p className="text-sm text-gray-600">{product.insurer_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{product.company_rating}</span>
                          </div>
                          <p className="text-xs text-gray-500">{product.region}</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Description */}
                      <p className="text-sm text-gray-700">{product.description}</p>

                      {/* Coverage */}
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Coverage:</span>
                        <span className="text-gray-700">{formatAmount(product.coverage_amount)}</span>
                      </div>

                      {/* Benefits */}
                      {product.extra_benefits && product.extra_benefits.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Heart className="w-4 h-4 text-purple-600" />
                            Extra Benefits
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {product.extra_benefits.slice(0, 4).map((benefit, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                            {product.extra_benefits.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.extra_benefits.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Special Features */}
                      <div className="flex flex-wrap gap-2">
                        {product.covers_pre_existing_conditions && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            Pre-existing Conditions
                          </Badge>
                        )}
                        {product.covers_high_risk_jobs && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            High-Risk Jobs
                          </Badge>
                        )}
                        {!product.requires_medical_exam && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            No Medical Exam
                          </Badge>
                        )}
                      </div>

                      {/* Pricing and CTA */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-purple-600">
                              {formatAmount(product.monthly_premium)}
                            </span>
                            <span className="text-sm text-gray-500">/month</span>
                          </div>
                          {product.annual_premium && (
                            <p className="text-xs text-gray-600">
                              or {formatAmount(product.annual_premium)}/year
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleGetQuote(product)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Get Quote
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Marketplace;
