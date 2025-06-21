
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { hasFeatureAccess } from '@/services/pricingService';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date?: string;
  currency: string;
  amount: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('basic');

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setLoading(false);
      setUserPlan('basic');
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching subscription:', error);
      } else if (data) {
        setSubscription(data);
        // Extract plan from plan_id (e.g., "Padlock Pro" -> "pro")
        const planName = data.plan_id.toLowerCase().includes('pro') ? 'pro' : 
                        data.plan_id.toLowerCase().includes('premium') ? 'premium' : 'basic';
        setUserPlan(planName);
      } else {
        setSubscription(null);
        setUserPlan('basic');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setUserPlan('basic');
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (feature: string): boolean => {
    return hasFeatureAccess(userPlan, feature);
  };

  const canAddPolicy = async (): Promise<{ allowed: boolean; count: number; limit: number }> => {
    if (!user) return { allowed: false, count: 0, limit: 0 };

    // Check current policy count
    const { count, error } = await supabase
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error checking policy count:', error);
      return { allowed: false, count: 0, limit: 0 };
    }

    const currentCount = count || 0;
    const limit = userPlan === 'basic' ? 3 : 999; // Unlimited for pro/premium
    
    return {
      allowed: currentCount < limit,
      count: currentCount,
      limit: limit
    };
  };

  return {
    subscription,
    userPlan,
    loading,
    hasAccess,
    canAddPolicy,
    refetch: fetchSubscription
  };
};
