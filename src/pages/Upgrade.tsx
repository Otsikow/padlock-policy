
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ArrowLeft, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { subscriptionPlans } from '@/services/pricingService';
import { useNavigate } from 'react-router-dom';
import { isStripeCurrencySupported } from '@/services/currencyService';
import PricingToggle from '@/components/PricingToggle';
import PlanCard from '@/components/PlanCard';
import TrustSignals from '@/components/TrustSignals';
import SubscriptionManager from '@/components/SubscriptionManager';
import CurrencySelector from '@/components/CurrencySelector';
import { Button } from '@/components/ui/button';

const Upgrade = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Logo and Padlock Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/da2d5e44-7846-4551-bd2b-b08a7a2190dc.png" 
              alt="Padlock Logo" 
              className="h-16 w-auto mr-4"
            />
            <Lock className="h-12 w-12 text-[#183B6B]" />
          </div>
          <h1 className="text-5xl font-bold text-[#183B6B] text-center">Padlock</h1>
          <p className="text-lg text-gray-600 mt-2 text-center">Secure Your Insurance Future</p>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
            <h2 className="text-4xl font-bold text-gray-900">Choose Your Plan</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start free, upgrade anytime. Get advanced AI insights and premium support as you grow.
          </p>
          
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />

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
          {subscriptionPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isAnnual={isAnnual}
              currency={currency}
              userPlan={userPlan}
              loading={loading}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <TrustSignals />

        {/* Currency Information */}
        <div className="mt-16">
          <CurrencySelector />
        </div>

        <SubscriptionManager subscription={subscription} />
      </div>
    </div>
  );
};

export default Upgrade;
