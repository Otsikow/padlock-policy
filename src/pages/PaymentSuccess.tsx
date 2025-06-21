
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type');

  useEffect(() => {
    if (sessionId) {
      // In a real app, you might want to verify the payment with your backend
      // For now, we'll just show success
      setPaymentDetails({
        sessionId,
        type,
        success: true
      });
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            {type === 'subscription' 
              ? 'Your subscription has been activated' 
              : 'Your payment has been processed successfully'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Transaction ID</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {sessionId?.substring(0, 20)}...
            </p>
          </div>
          
          {type === 'subscription' && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🎉 Welcome to Padlock Pro! Your premium features are now active.
              </p>
            </div>
          )}
          
          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {type === 'subscription' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/settings')}
                className="w-full"
              >
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
