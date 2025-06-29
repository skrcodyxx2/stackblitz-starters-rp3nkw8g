import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../lib/database';

interface AuthContextType {
  user: Omit<User, 'password_hash'> | null;
  profile: Omit<User, 'password_hash'> | null;
  session: { token: string; expires_at: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password_hash'> | null>(null);
  const [profile, setProfile] = useState<Omit<User, 'password_hash'> | null>(null);
  const [session, setSession] = useState<{ token: string; expires_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session depuis localStorage
    const storedSession = localStorage.getItem('auth_session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        fetchProfile(parsedSession.token);
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        localStorage.removeItem('auth_session');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setProfile(userData);
      } else {
        // Session expirée ou invalide
        localStorage.removeItem('auth_session');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      localStorage.removeItem('auth_session');
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la connexion');
    }

    const { user: userData, session: sessionData } = await response.json();
    
    setUser(userData);
    setProfile(userData);
    setSession(sessionData);
    
    // Sauvegarder la session
    localStorage.setItem('auth_session', JSON.stringify(sessionData));
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, userData })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }

    const { user: newUser, session: sessionData } = await response.json();
    
    setUser(newUser);
    setProfile(newUser);
    setSession(sessionData);
    
    // Sauvegarder la session
    localStorage.setItem('auth_session', JSON.stringify(sessionData));
  };

  const signOut = async () => {
    if (session) {
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    }

    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('auth_session');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!session) throw new Error('Non connecté');
    
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }

    const updatedUser = await response.json();
    setUser(updatedUser);
    setProfile(updatedUser);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}