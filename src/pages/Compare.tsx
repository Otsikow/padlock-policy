
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingDown, Shield, Zap } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/useCurrency';

const Compare = () => {
  const { formatAmount } = useCurrency();
  
  const [offers] = useState([
    {
      id: 1,
      insurerName: 'SecureLife Insurance',
      policyType: 'Health',
      estimatedPremium: 380,
      originalPremium: 450,
      savings: 70,
      rating: 4.8,
      features: ['24/7 Support', 'Preventive Care', 'Specialist Coverage'],
      recommended: true
    },
    {
      id: 2,
      insurerName: 'AutoGuard Pro',
      policyType: 'Auto',
      estimatedPremium: 285,
      originalPremium: 320,
      savings: 35,
      rating: 4.6,
      features: ['Roadside Assistance', 'Accident Forgiveness', 'Glass Coverage'],
      recommended: false
    },
    {
      id: 3,
      insurerName: 'LifeShield Plus',
      policyType: 'Life',
      estimatedPremium: 165,
      originalPremium: 180,
      savings: 15,
      rating: 4.7,
      features: ['Flexible Premiums', 'Cash Value', 'No Medical Exam'],
      recommended: false
    },
    {
      id: 4,
      insurerName: 'HealthFirst Elite',
      policyType: 'Health',
      estimatedPremium: 420,
      originalPremium: 450,
      savings: 30,
      rating: 4.9,
      features: ['Premium Network', 'Mental Health', 'Telehealth'],
      recommended: false
    }
  ]);

  const totalSavings = offers.reduce((sum, offer) => sum + offer.savings, 0);

  useEffect(() => {
    handleUrlParams();
  }, []);

  const handleUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const fromPolicyId = urlParams.get('from_policy_id');
    const policyType = urlParams.get('policy_type');

    if (status === 'switching' && fromPolicyId) {
      toast({
        title: "Policy Switch Initiated",
        description: `We're showing you better ${policyType || 'insurance'} options. Compare and choose the best deal for you.`,
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 via-indigo-50/30 to-purple-50/20 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#183B6B] via-[#2a5490] via-[#3461a8] to-[#1e4a78] text-white p-4 sm:p-6 rounded-b-3xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold drop-shadow-lg">Better Insurance Deals</h1>
            <p className="text-white/90 drop-shadow-sm text-sm sm:text-base">Find competitive rates and save money</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-xl">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
            />
          </div>
        </div>
        
        {/* Savings Summary */}
        <div className="mt-4 bg-gradient-to-r from-white/20 via-white/15 to-white/10 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-[#E2B319]" />
              <span className="text-white/95 text-sm sm:text-base font-medium">Potential Monthly Savings</span>
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#E2B319] drop-shadow-lg">{formatAmount(totalSavings)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {offers.map((offer) => (
            <Card key={offer.id} className={`shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 ${offer.recommended ? 'ring-2 ring-[#E2B319] shadow-2xl transform hover:scale-[1.02]' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="bg-gradient-to-r from-[#183B6B] to-[#2a5490] bg-clip-text text-transparent text-lg sm:text-xl">{offer.insurerName}</CardTitle>
                    <p className="text-sm text-gray-600">{offer.policyType} Insurance</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    {offer.recommended && (
                      <Badge className="bg-gradient-to-r from-[#E2B319] to-[#f5c842] text-black shadow-md w-fit">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{offer.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl sm:text-3xl font-bold text-[#183B6B]">{formatAmount(offer.estimatedPremium)}</span>
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="line-through text-gray-400">{formatAmount(offer.originalPremium)}</span>
                      <span className="text-green-600 font-medium">Save {formatAmount(offer.savings)}</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto text-left sm:text-right">
                    <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-2 rounded-full text-xs font-medium shadow-sm inline-block">
                      {Math.round((offer.savings / offer.originalPremium) * 100)}% OFF
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium text-[#183B6B] mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Key Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {offer.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-300 bg-white/70">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    offer.recommended 
                      ? 'bg-gradient-to-r from-[#E2B319] via-[#f5c842] to-[#f0c432] hover:from-[#d4a617] hover:via-[#e6b73a] hover:to-[#d9b82e] text-black' 
                      : 'bg-gradient-to-r from-[#183B6B] via-[#2a5490] to-[#1e4a78] hover:from-[#1a3d6f] hover:via-[#2d5799] hover:to-[#1f4b7b] text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Switch to This Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            className="w-full mt-6 border-[#183B6B] text-[#183B6B] hover:bg-gradient-to-r hover:from-[#183B6B] hover:via-[#2a5490] hover:to-[#1e4a78] hover:text-white shadow-lg transition-all duration-300"
          >
            Refresh Suggestions
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Compare;
