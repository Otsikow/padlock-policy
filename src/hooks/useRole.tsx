import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Custom hook for server-side role validation
 * Uses SECURITY DEFINER functions to ensure secure role checking
 */
export const useRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [canProcessClaims, setCanProcessClaims] = useState<boolean>(false);
  const [canReviewClaims, setCanReviewClaims] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setCanProcessClaims(false);
      setCanReviewClaims(false);
      setRoles([]);
      setLoading(false);
      return;
    }

    const checkRoles = async () => {
      try {
        // Use parallel queries for better performance
        const [adminResult, processResult, reviewResult, rolesResult] = await Promise.all([
          supabase.rpc('is_admin'),
          supabase.rpc('can_process_claims'),
          supabase.rpc('can_review_claims'),
          supabase.rpc('get_user_roles'),
        ]);

        if (adminResult.data !== null) {
          setIsAdmin(adminResult.data);
        }

        if (processResult.data !== null) {
          setCanProcessClaims(processResult.data);
        }

        if (reviewResult.data !== null) {
          setCanReviewClaims(reviewResult.data);
        }

        if (rolesResult.data) {
          setRoles(rolesResult.data.map((r: any) => r.role));
        }
      } catch (error) {
        console.error('Error checking roles:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [user]);

  /**
   * Check if user has a specific role
   * Uses server-side SECURITY DEFINER function
   */
  const hasRole = async (role: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_role', {
        check_role: role,
      });

      if (error) {
        console.error('Error checking role:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  };

  /**
   * Refresh role information
   */
  const refreshRoles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [adminResult, processResult, reviewResult, rolesResult] = await Promise.all([
        supabase.rpc('is_admin'),
        supabase.rpc('can_process_claims'),
        supabase.rpc('can_review_claims'),
        supabase.rpc('get_user_roles'),
      ]);

      if (adminResult.data !== null) setIsAdmin(adminResult.data);
      if (processResult.data !== null) setCanProcessClaims(processResult.data);
      if (reviewResult.data !== null) setCanReviewClaims(reviewResult.data);
      if (rolesResult.data) setRoles(rolesResult.data.map((r: any) => r.role));
    } catch (error) {
      console.error('Error refreshing roles:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    canProcessClaims,
    canReviewClaims,
    roles,
    loading,
    hasRole,
    refreshRoles,
  };
};

/**
 * Hook for checking admin access with redirect
 * Useful for protecting admin-only pages
 */
export const useRequireAdmin = (redirectPath: string = '/dashboard') => {
  const { isAdmin, loading } = useRole();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!loading) {
      setIsAuthorized(isAdmin);
      if (!isAdmin && typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
    }
  }, [isAdmin, loading, redirectPath]);

  return { isAuthorized, loading };
};

/**
 * Hook for checking claims processing access
 */
export const useRequireClaimsAccess = (redirectPath: string = '/dashboard') => {
  const { canProcessClaims, loading } = useRole();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!loading) {
      setIsAuthorized(canProcessClaims);
      if (!canProcessClaims && typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
    }
  }, [canProcessClaims, loading, redirectPath]);

  return { isAuthorized, loading };
};
