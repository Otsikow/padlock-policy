
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Crown, Zap } from 'lucide-react';
import { subscriptionPlans, formatPrice, getUpgradePrompt } from '@/services/pricingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  feature: string;
  userPlan?: string;
  onClose: () => void;
  trigger?: 'policy_limit' | 'advanced_ai' | 'support' | 'feature_access';
}

const UpgradePrompt = ({ feature, userPlan = 'basic', onClose, trigger = 'feature_access' }: UpgradePromptProps) => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const promptMessage = getUpgradePrompt(userPlan, trigger);
  const recommendedPlan = trigger === 'policy_limit' || trigger === 'advanced_ai' ? 'pro' : 'premium';
  const plan = subscriptionPlans.find(p => p.id === recommendedPlan);

  if (!plan) return null;

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(planId);

    try {
      const selectedPlan = subscriptionPlans.find(p => p.id === planId);
      if (!selectedPlan) throw new Error('Plan not found');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'subscription',
          planId: selectedPlan.name,
          currency: currency?.code || 'GBP',
          amount: selectedPlan.prices[currency?.code as keyof typeof selectedPlan.prices] || selectedPlan.prices.GBP,
          interval: 'month'
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      onClose();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {recommendedPlan === 'pro' ? (
              <Zap className="h-5 w-5 text-blue-500" />
            ) : (
              <Crown className="h-5 w-5 text-purple-500" />
            )}
            <CardTitle className="text-lg">Upgrade Required</CardTitle>
          </div>
          <CardDescription>{promptMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <Badge variant="secondary">Recommended</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(plan.prices[currency?.code as keyof typeof plan.prices] || plan.prices.GBP, currency?.code || 'GBP')}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </div>
            <ul className="mt-3 space-y-1">
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading === plan.id}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading === plan.id ? "Processing..." : `Upgrade to ${plan.name}`}
            </Button>
            <Button
              onClick={() => navigate('/upgrade')}
              variant="outline"
              className="flex-1"
            >
              View All Plans
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Upgrade anytime • Cancel anytime • 30-day money-back guarantee
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradePrompt;
