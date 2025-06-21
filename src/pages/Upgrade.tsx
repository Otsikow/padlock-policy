
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { subscriptionPlans, formatPrice, getStripeCurrency, convertCurrency } from '@/services/pricingService';
import { useNavigate } from 'react-router-dom';

const Upgrade = () => {
  const { user } = useAuth();
  const { userCountry, currency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching subscription:', error);
      } else {
        setCurrentSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

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
      const stripeCurrency = getStripeCurrency(displayCurrency);
      const priceSource = isAnnual ? plan.annualPrices : plan.prices;
      const amount = displayCurrency !== stripeCurrency 
        ? convertCurrency(priceSource[displayCurrency as keyof typeof priceSource], displayCurrency, stripeCurrency)
        : priceSource[stripeCurrency as keyof typeof priceSource];

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'subscription',
          planId: plan.name,
          currency: stripeCurrency,
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
    return currentSubscription?.plan_id?.toLowerCase().includes(planId);
  };

  const getPrice = (plan: any) => {
    const priceSource = isAnnual ? plan.annualPrices : plan.prices;
    return formatPrice(priceSource[currency?.code as keyof typeof priceSource] || priceSource.GBP, currency?.code || 'GBP');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Unlock the full potential of Padlock with our premium features
          </p>
          
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
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Save up to 17%</Badge>
            </span>
          </div>

          {currency && (
            <p className="text-sm text-gray-500">
              Prices shown in {currency.code} for {userCountry}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.id === 'pro' ? 'border-blue-500 shadow-lg scale-105' : ''
              } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.id === 'pro' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              {isCurrentPlan(plan.id) && (
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
                  <span className="text-4xl font-bold text-gray-900">
                    {getPrice(plan)}
                  </span>
                  {!plan.isFree && (
                    <span className="text-gray-600">/{isAnnual ? 'year' : 'month'}</span>
                  )}
                </div>
                {plan.policyLimit && (
                  <div className="text-sm text-gray-500 mt-2">
                    {plan.policyLimit} • {plan.bestFor}
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
                  disabled={loading === plan.id || isCurrentPlan(plan.id)}
                  className={`w-full ${
                    plan.id === 'basic'
                      ? 'bg-gray-700 hover:bg-gray-800'
                      : plan.id === 'pro' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {loading === plan.id ? (
                    "Processing..."
                  ) : isCurrentPlan(plan.id) ? (
                    "Current Plan"
                  ) : plan.isFree ? (
                    "Get Started Free"
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
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
                  <td className="px-6 py-4 font-medium">Policy Limit</td>
                  <td className="px-6 py-4 text-center">3</td>
                  <td className="px-6 py-4 text-center">Unlimited</td>
                  <td className="px-6 py-4 text-center">Unlimited</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">AI Analysis</td>
                  <td className="px-6 py-4 text-center">Basic</td>
                  <td className="px-6 py-4 text-center">Advanced</td>
                  <td className="px-6 py-4 text-center">Advanced</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Claims Assistance</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">Priority Support</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                  <td className="px-6 py-4 text-center">VIP</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Personal Advisor</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">Comparison Tools</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">White-glove Support</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">Document Vault</td>
                  <td className="px-6 py-4 text-center">—</td>
                  <td className="px-6 py-4 text-center">✓</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {currentSubscription && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Manage Your Subscription</CardTitle>
                <CardDescription>
                  Update payment method, view invoices, or cancel subscription
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
