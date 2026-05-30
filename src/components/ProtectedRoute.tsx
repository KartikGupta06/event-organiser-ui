import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('[EventHub ProtectedRoute] Protected Route Check - Path:', location.pathname, 'Loading:', loading, 'User:', user?.email, 'Role:', profile?.role);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    console.log('[EventHub ProtectedRoute] Redirecting to Auth - Unauthenticated access attempt to:', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to dashboard if admin access is required but user is not admin
  if (adminOnly && profile?.role !== 'admin') {
    console.log('[EventHub ProtectedRoute] Unauthorized Admin Access - Redirecting to Dashboard from:', location.pathname);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;