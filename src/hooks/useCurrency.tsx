
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getCurrencyByCountry, formatCurrency } from '@/services/currencyService';
import { detectUserCountry, getTimezoneCountry } from '@/services/geolocationService';

export const useCurrency = () => {
  const { user } = useAuth();
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserCountry();
    } else {
      // For non-authenticated users, auto-detect country
      autoDetectCountry();
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
        // Auto-detect if no saved preference
        await autoDetectCountry();
      } else if (data?.country) {
        setUserCountry(data.country);
        setAutoDetected(false);
        setLoading(false);
      } else {
        // No saved country, auto-detect
        await autoDetectCountry();
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
      await autoDetectCountry();
    }
  };

  const autoDetectCountry = async () => {
    try {
      setLoading(true);
      
      // Try multiple detection methods
      let detectedCountry = await detectUserCountry();
      
      // Fallback to timezone detection
      if (!detectedCountry || detectedCountry === 'GB') {
        const timezoneCountry = getTimezoneCountry();
        if (timezoneCountry !== 'GB') {
          detectedCountry = timezoneCountry;
        }
      }
      
      setUserCountry(detectedCountry);
      setAutoDetected(true);
      
      // Save detected country for authenticated users
      if (user && detectedCountry) {
        await updateUserCountry(detectedCountry, false);
      }
    } catch (error) {
      console.error('Country auto-detection failed:', error);
      setUserCountry('GB'); // Default fallback
      setAutoDetected(false);
    } finally {
      setLoading(false);
    }
  };

  const updateUserCountry = async (countryCode: string, showSuccess: boolean = true) => {
    if (!user) {
      // For non-authenticated users, just update local state
      setUserCountry(countryCode);
      setAutoDetected(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ country: countryCode })
        .eq('id', user.id);

      if (error) throw error;
      
      setUserCountry(countryCode);
      setAutoDetected(false);
      
      if (showSuccess) {
        console.log(`Currency updated to ${countryCode}`);
      }
    } catch (error) {
      console.error('Error updating user country:', error);
      throw error;
    }
  };

  const currency = getCurrencyByCountry(userCountry);

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, userCountry);
  };

  const refreshCountry = async () => {
    await autoDetectCountry();
  };

  return {
    userCountry,
    currency,
    formatAmount,
    updateUserCountry,
    loading,
    autoDetected,
    refreshCountry,
  };
};
