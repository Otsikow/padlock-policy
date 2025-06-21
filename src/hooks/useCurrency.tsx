
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getCurrencyByCountry, formatCurrency } from '@/services/currencyService';
import { detectUserCountry, getTimezoneCountry } from '@/services/geolocationService';
import { toast } from '@/hooks/use-toast';

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
      console.log('Fetching user country for user:', user.id);
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
        console.log('Found saved country:', data.country);
        setUserCountry(data.country);
        setAutoDetected(false);
        setLoading(false);
      } else {
        // No saved country, auto-detect
        console.log('No saved country, auto-detecting...');
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
      
      console.log('Auto-detected country:', detectedCountry);
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
      console.log('Updating user country to:', countryCode, 'for user:', user.id);
      
      // First check if profile exists, if not create it
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating new profile');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            country: countryCode,
            full_name: user.user_metadata?.first_name && user.user_metadata?.last_name 
              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
              : user.email
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
      } else if (fetchError) {
        console.error('Error checking profile:', fetchError);
        throw fetchError;
      } else {
        // Profile exists, update it
        console.log('Profile exists, updating country');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ country: countryCode })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
      }
      
      setUserCountry(countryCode);
      setAutoDetected(false);
      
      if (showSuccess) {
        const currency = getCurrencyByCountry(countryCode);
        toast({
          title: "Currency Updated",
          description: `Prices will now be shown in ${currency.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error updating user country:', error);
      toast({
        title: "Error",
        description: `Failed to update currency: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const currency = getCurrencyByCountry(userCountry);

  // This is the key function - it ALWAYS uses the user's preferred currency
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, userCountry);
  };

  const refreshCountry = async () => {
    await autoDetectCountry();
  };

  return {
    userCountry,
    currency,
    formatAmount, // This ensures consistent formatting everywhere
    updateUserCountry,
    loading,
    autoDetected,
    refreshCountry,
  };
};
