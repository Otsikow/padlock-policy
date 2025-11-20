import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role_enum'];

interface AdminStatus {
  isAdmin: boolean;
  isPartner: boolean;
  role: UserRole | null;
  loading: boolean;
}

/**
 * Hook to check if the current user is an admin or partner
 * @returns AdminStatus object with role information
 */
export const useAdmin = (): AdminStatus => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('customer'); // Default to customer on error
        } else {
          setRole(data?.role || 'customer');
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole('customer');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserRole();
    }
  }, [user, authLoading]);

  return {
    isAdmin: role === 'admin',
    isPartner: role === 'partner' || role === 'admin',
    role,
    loading: authLoading || loading,
  };
};
