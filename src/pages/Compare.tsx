
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingDown, Shield, Zap } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Compare = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#183B6B] text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-2">Better Insurance Deals</h1>
        <p className="text-white/80">Find competitive rates and save money</p>
        
        {/* Savings Summary */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-[#E2B319]" />
              <span className="text-white/90">Potential Monthly Savings</span>
            </div>
            <span className="text-2xl font-bold text-[#E2B319]">${totalSavings}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id} className={`shadow-lg border-0 ${offer.recommended ? 'ring-2 ring-[#E2B319]' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-[#183B6B] text-lg">{offer.insurerName}</CardTitle>
                    <p className="text-sm text-gray-600">{offer.policyType} Insurance</p>
                  </div>
                  <div className="text-right">
                    {offer.recommended && (
                      <Badge className="bg-[#E2B319] text-black mb-2">
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-[#183B6B]">${offer.estimatedPremium}</span>
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="line-through text-gray-400">${offer.originalPremium}</span>
                      <span className="text-green-600 font-medium">Save ${offer.savings}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
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
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full font-semibold py-3 rounded-lg ${
                    offer.recommended 
                      ? 'bg-[#E2B319] hover:bg-[#d4a617] text-black' 
                      : 'bg-[#183B6B] hover:bg-[#1a3d6f] text-white'
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
        <Button 
          variant="outline" 
          className="w-full mt-6 border-[#183B6B] text-[#183B6B] hover:bg-[#183B6B] hover:text-white"
        >
          Refresh Suggestions
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Compare;
