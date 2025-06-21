
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { PricingPlan, getSavingsPercentage } from '@/services/pricingService';
import PriceDisplay from '@/components/PriceDisplay';

interface PlanCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  currency?: { code: string; name: string; symbol: string };
  userPlan: string;
  loading: string | null;
  onSubscribe: (planId: string) => void;
}

const PlanCard = ({ plan, isAnnual, currency, userPlan, loading, onSubscribe }: PlanCardProps) => {
  const isCurrent = userPlan === plan.id;
  const isPopular = plan.id === 'pro';
  const isPremium = plan.id === 'premium';
  const priceSource = isAnnual ? plan.annualPrices : plan.prices;
  const baseAmount = priceSource[currency?.code as keyof typeof priceSource] || priceSource.GBP;

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="h-6 w-6" />;
      case 'pro': return <Star className="h-6 w-6" />;
      case 'premium': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-xl ${
        isPopular ? 'border-blue-500 shadow-lg scale-105' : ''
      } ${isPremium ? 'border-yellow-400 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50' : ''} ${
        isCurrent ? 'ring-2 ring-green-500' : ''
      }`}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Most Popular
        </Badge>
      )}
      {isPremium && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          Premium
        </Badge>
      )}
      {isCurrent && (
        <Badge className="absolute -top-3 right-4 bg-green-500">
          Current Plan
        </Badge>
      )}
      
      <CardHeader className="text-center pb-8">
        <div className="flex justify-center mb-4">
          <div className={isPremium ? 'text-yellow-600' : ''}>
            {getPlanIcon(plan.id)}
          </div>
        </div>
        <CardTitle className={`text-2xl font-bold ${isPremium ? 'text-yellow-700' : ''}`}>
          {plan.name}
        </CardTitle>
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
          onClick={() => onSubscribe(plan.id)}
          disabled={loading === plan.id || isCurrent}
          className={`w-full ${
            plan.id === 'basic'
              ? 'bg-gray-700 hover:bg-gray-800'
              : plan.id === 'pro' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
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
};

export default PlanCard;
