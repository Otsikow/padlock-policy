
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionManagerProps {
  subscription: any;
}

const SubscriptionManager = ({ subscription }: SubscriptionManagerProps) => {
  if (!subscription) return null;

  const handleManageSubscription = async () => {
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
  };

  return (
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
            onClick={handleManageSubscription}
            className="w-full"
          >
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
