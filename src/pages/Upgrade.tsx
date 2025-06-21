import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Zap, Star, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { subscriptionPlans, formatPrice, getStripeCurrency, convertCurrency, getSavingsPercentage } from '@/services/pricingService';
import { useNavigate } from 'react-router-dom';
import CurrencySelector from '@/components/CurrencySelector';
import PriceDisplay from '@/components/PriceDisplay';
import { getCurrencyDisplayInfo, isStripeCurrencySupported } from '@/services/currencyService';

const Upgrade = () => {
  const { user } = useAuth();
  const { userCountry, currency } = useCurrency();
  const { userPlan, subscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Handle free plan
    if (planId === 'basic') {
      toast({
        title: "Free Plan",
        description: "You're already using the free plan! Upload your policies to get started.",
      });
      navigate('/upload');
      return;
    }

    setLoading(planId);

    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const displayCurrency = currency?.code || 'GBP';
      const priceSource = isAnnual ? plan.annualPrices : plan.prices;
      let billingCurrency = displayCurrency;
      let amount = priceSource[displayCurrency as keyof typeof priceSource];

      // If user's currency isn't supported by Stripe, bill in GBP
      if (!isStripeCurrencySupported(displayCurrency)) {
        billingCurrency = 'GBP';
        amount = priceSource.GBP;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'subscription',
          planId: plan.name,
          currency: billingCurrency,
          amount: amount,
          interval: isAnnual ? 'year' : 'month'
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="h-6 w-6" />;
      case 'pro': return <Star className="h-6 w-6" />;
      case 'premium': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return userPlan === planId;
  };

  const getPrice = (plan: any) => {
    const priceSource = isAnnual ? plan.annualPrices : plan.prices;
    return formatPrice(priceSource[currency?.code as keyof typeof priceSource] || priceSource.GBP, currency?.code || 'GBP');
  };

  const getSavings = (plan: any) => {
    if (plan.isFree) return null;
    return getSavingsPercentage(plan, currency?.code || 'GBP');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start free, upgrade anytime. Get advanced AI insights and premium support as you grow.
          </p>
          
          {/* Currency Selector */}
          <div className="mb-8">
            <CurrencySelector compact={true} showCard={false} />
          </div>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`text-sm ${!isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm ${isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              Annual 
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">2 months free</Badge>
            </span>
          </div>

          {currency && (
            <p className="text-sm text-gray-500">
              Prices shown in {currency.name} ({currency.code})
              {!isStripeCurrencySupported(currency.code) && 
                <span className="ml-1 text-blue-600">• Billing in GBP with approximate conversion</span>
              }
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);
            const isPopular = plan.id === 'pro';
            const priceSource = isAnnual ? plan.annualPrices : plan.prices;
            const baseAmount = priceSource[currency?.code as keyof typeof priceSource] || priceSource.GBP;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  isPopular ? 'border-blue-500 shadow-lg scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    Current Plan
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.id)}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-lg">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <PriceDisplay
                      baseAmount={baseAmount}
                      baseCurrency={currency?.code || 'GBP'}
                      interval={isAnnual ? 'year' : 'month'}
                      size="md"
                    />
                    {isAnnual && !plan.isFree && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save {getSavingsPercentage(plan, currency?.code || 'GBP')}% annually
                      </div>
                    )}
                  </div>
                  {plan.policyLimit && (
                    <div className="text-sm text-gray-500 mt-2">
                      {plan.policyLimit} • {plan.bestFor}
                    </div>
                  )}
                  {plan.supportLevel && (
                    <div className="text-xs text-blue-600 mt-1">
                      {plan.supportLevel}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || isCurrent}
                    className={`w-full ${
                      plan.id === 'basic'
                        ? 'bg-gray-700 hover:bg-gray-800'
                        : plan.id === 'pro' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {loading === plan.id ? (
                      "Processing..."
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : plan.isFree ? (
                      "Get Started Free"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>

                  {plan.id === 'pro' && !isCurrent && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Try free for 7 days • Cancel anytime
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust signals */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              Secure payments by Stripe
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Basic (Free)</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Pro (£3.99/mo)</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Premium (£9.99/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-medium">Policy Storage</td>
                  <td className="px-6 py-4 text-center">Up to 3</td>
                  <td className="px-6 py-4 text-center">Unlimited</td>
                  <td className="px-6 py-4 text-center">Unlimited</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">AI Analysis</td>
                  <td className="px-6 py-4 text-center">Basic</td>
                  <td className="px-6 py-4 text-center">Advanced with insights</td>
                  <td className="px-6 py-4 text-center">Advanced with insights</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Support</td>
                  <td className="px-6 py-4 text-center">Email only</td>
                  <td className="px-6 py-4 text-center">Priority (&lt;24h)</td>
                  <td className="px-6 py-4 text-center">White-glove (live chat/phone)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">Claims Assistance</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Document Vault</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">Dedicated Advisor</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Comparison Tools</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">Early Access</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Currency Information */}
        <div className="mt-16">
          <CurrencySelector />
        </div>

        {subscription && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Manage Your Subscription</CardTitle>
                <CardDescription>
                  Update payment method, view invoices, or manage your plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke('customer-portal');
                      if (error) throw error;
                      window.open(data.url, '_blank');
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: "Failed to open customer portal",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full"
                >
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upgrade;
