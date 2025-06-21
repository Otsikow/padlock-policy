
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, FileText, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { oneTimeServices, formatPrice, getStripeCurrency, convertCurrency } from '@/services/pricingService';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const { user } = useAuth();
  const { userCountry, currency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (serviceId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(serviceId);

    try {
      const service = oneTimeServices.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      const displayCurrency = currency;
      const stripeCurrency = getStripeCurrency(displayCurrency);
      const amount = displayCurrency !== stripeCurrency 
        ? convertCurrency(service.prices[displayCurrency as keyof typeof service.prices], displayCurrency, stripeCurrency)
        : service.prices[stripeCurrency as keyof typeof service.prices];

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'payment',
          service: service.name,
          currency: stripeCurrency,
          amount: amount
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

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'switch-assistant': return <ArrowRight className="h-8 w-8" />;
      case 'expert-advice': return <Users className="h-8 w-8" />;
      case 'policy-review': return <FileText className="h-8 w-8" />;
      default: return <MessageSquare className="h-8 w-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Premium Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get expert help with your insurance needs through our one-time services
          </p>
          {currency && (
            <p className="text-sm text-gray-500 mt-2">
              Prices shown in {currency} for {userCountry}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {oneTimeServices.map((service) => (
            <Card key={service.id} className="transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4 text-blue-600">
                  {getServiceIcon(service.id)}
                </div>
                <CardTitle className="text-xl font-bold">{service.name}</CardTitle>
                <CardDescription className="text-base">{service.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(service.prices[currency as keyof typeof service.prices] || service.prices.GBP, currency || 'GBP')}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <Button
                  onClick={() => handlePurchase(service.id)}
                  disabled={loading === service.id}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading === service.id ? "Processing..." : `Purchase ${service.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">Need Something Custom?</CardTitle>
              <CardDescription className="text-lg">
                Contact our team for personalized insurance solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="lg" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;
