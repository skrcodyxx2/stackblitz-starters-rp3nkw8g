import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Effect to handle role-based access
  useEffect(() => {
    // Only check after loading is complete and we have user data
    if (!loading && user && profile) {
      // Special case for admin routes
      if (requiredRole === 'admin' && profile.role !== 'admin' && profile.role !== 'employee') {
        toast.error('Accès non autorisé. Vous n\'avez pas les permissions nécessaires.');
        navigate('/');
      }
      
      // Special case for client routes
      if (requiredRole === 'client' && profile.role === 'admin') {
        // Admins can access client routes, but we'll redirect them to admin dashboard
        navigate('/admin');
      }
    }
  }, [loading, user, profile, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/connexion" replace />;
  }

  // Handle role-based access
  if (requiredRole) {
    // Admin and employee can access admin routes
    if (requiredRole === 'admin' && profile.role !== 'admin' && profile.role !== 'employee') {
      return <Navigate to="/" replace />;
    }
    
    // Admin can access client routes (they'll be redirected in the useEffect)
    if (requiredRole === 'client' && profile.role !== 'client' && profile.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;