import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // If true, requires admin role. If false, partner or admin is sufficient
}

/**
 * Component to protect admin-only routes
 * Redirects to dashboard if user is not authorized
 */
export const AdminRoute = ({ children, requireAdmin = true }: AdminRouteProps) => {
  const { isAdmin, isPartner, loading } = useAdmin();

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user has required permissions
  const hasAccess = requireAdmin ? isAdmin : isPartner;

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
