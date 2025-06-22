
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PriceDisplay from '@/components/PriceDisplay';
import PricingToggle from '@/components/PricingToggle';
import { subscriptionPlans, getSavingsPercentage } from '@/services/pricingService';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isStripeCurrencySupported } from '@/services/currencyService';

const PricingSection = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  // Use current plans from pricingService with annual/monthly toggle
  const plans = subscriptionPlans.map(plan => {
    const priceSource = isAnnual ? plan.annualPrices : plan.prices;
    return {
      name: plan.name,
      description: plan.description,
      price: priceSource.GBP,
      features: plan.features,
      popular: plan.id === 'pro',
      id: plan.id,
      plan: plan // Keep reference to full plan for savings calculation
    };
  });

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Handle free plan
    if (planId === 'basic') {
      navigate('/dashboard');
      return;
    }

    setLoading(planId);

    try {
      const selectedPlan = subscriptionPlans.find(p => p.id === planId);
      if (!selectedPlan) throw new Error('Plan not found');

      const displayCurrency = currency?.code || 'GBP';
      let billingCurrency = displayCurrency;
      
      // Use annual or monthly pricing based on toggle
      const priceSource = isAnnual ? selectedPlan.annualPrices : selectedPlan.prices;
      let amount = priceSource[displayCurrency as keyof typeof priceSource];

      // If user's currency isn't supported by Stripe, bill in GBP
      if (!isStripeCurrencySupported(displayCurrency)) {
        billingCurrency = 'GBP';
        amount = priceSource.GBP;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'subscription',
          planId: selectedPlan.name,
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

  const getButtonText = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'Start Free Today';
      case 'pro':
        return 'Upgrade To Pro';
      case 'premium':
        return 'Upgrade To Premium';
      default:
        return 'Get Started';
    }
  };

  const getButtonStyles = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'pro':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'premium':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white';
      default:
        return '';
    }
  };

  return (
    <section className="section-padding bg-gradient-to-br from-purple-50 to-pink-50" aria-labelledby="pricing-title">
      <div className="container-responsive max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 id="pricing-title" className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your insurance management needs
          </p>
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </div>
        
        <div className="grid-responsive-1-3 gap-6 md:gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:scale-105 ${
                plan.id === 'basic' ? 'ring-2 ring-green-400 shadow-green-100' : ''
              } ${
                plan.popular ? 'ring-2 ring-blue-400 shadow-blue-100' : ''
              } ${
                plan.id === 'premium' ? 'ring-2 ring-purple-400 shadow-purple-100 bg-gradient-to-br from-purple-50/50 to-pink-50/50' : ''
              }`}
            >
              {plan.id === 'basic' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                  Free
                </Badge>
              )}
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                  Most Popular
                </Badge>
              )}
              {plan.id === 'premium' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                  Premium
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className={`text-xl md:text-2xl font-bold ${
                  plan.id === 'basic' ? 'text-green-700' : 
                  plan.id === 'premium' ? 'text-purple-700' : 'text-gray-900'
                }`}>
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  {plan.description}
                </CardDescription>
                <div className="mb-4">
                  <PriceDisplay 
                    baseAmount={plan.price} 
                    baseCurrency="GBP" 
                    size="lg" 
                    showBadge={false}
                    interval={isAnnual ? 'year' : 'month'}
                  />
                  {isAnnual && !plan.plan.isFree && (
                    <div className="text-sm text-green-600 font-medium mt-2">
                      Save {getSavingsPercentage(plan.plan, currency?.code || 'GBP')}% annually
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6" role="list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.id === 'basic' ? 'text-green-500' : 
                        plan.id === 'premium' ? 'text-purple-500' : 'text-blue-500'
                      }`} aria-hidden="true" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full shadow-lg ${getButtonStyles(plan.id)}`} 
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  aria-label={`${getButtonText(plan.id)} - ${plan.name} plan`}
                >
                  {loading === plan.id ? "Processing..." : getButtonText(plan.id)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
