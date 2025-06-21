
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getCurrencyByCountry, formatCurrency } from '@/services/currencyService';

export const useCurrency = () => {
  const { user } = useAuth();
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserCountry();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserCountry = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('country')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user country:', error);
        setUserCountry('GB'); // Default to GB
      } else {
        setUserCountry(data?.country || 'GB');
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
      setUserCountry('GB');
    } finally {
      setLoading(false);
    }
  };

  const updateUserCountry = async (countryCode: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ country: countryCode })
        .eq('id', user.id);

      if (error) throw error;
      
      setUserCountry(countryCode);
    } catch (error) {
      console.error('Error updating user country:', error);
      throw error;
    }
  };

  const currency = getCurrencyByCountry(userCountry);

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, userCountry);
  };

  return {
    userCountry,
    currency,
    formatAmount,
    updateUserCountry,
    loading,
  };
};
