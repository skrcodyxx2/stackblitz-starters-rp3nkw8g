import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/connexion" replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    // Redirect based on user role
    const redirectPath = profile.role === 'admin' ? '/admin' : '/client';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;