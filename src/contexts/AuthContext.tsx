import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signUp, signOut, getCurrentUser, updateProfile as updateUserProfile } from '../lib/auth.js';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'admin' | 'employee' | 'client';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  must_change_password: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur actuel si un token existe
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await getCurrentUser(token);
        
        if (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
          setProfile(null);
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        } else if (data) {
          setUser(data.user);
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data) {
        setUser(data.user);
        setProfile(data.profile);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        toast.success('Connexion réussie !');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error(error.message || 'Erreur lors de la connexion');
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      const { data, error } = await signUp(email, password, userData);
      
      if (error) throw error;
      
      if (data) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        
        // Récupérer le profil complet
        const profileResult = await getCurrentUser(data.token);
        if (profileResult.data) {
          setProfile(profileResult.data.profile);
        }
        
        toast.success('Compte créé avec succès !');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      toast.error(error.message || 'Erreur lors de la création du compte');
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      if (token) {
        await signOut(token);
      }
      
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setProfile(null);
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      toast.error(error.message || 'Erreur lors de la déconnexion');
      throw error;
    }
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!user || !token) {
      toast.error('Vous devez être connecté pour mettre à jour votre profil');
      throw new Error('Non authentifié');
    }
    
    try {
      const { data, error } = await updateUserProfile(user.id, updates, token);
      
      if (error) throw error;
      
      if (data) {
        setProfile(prev => prev ? { ...prev, ...data } : data);
        toast.success('Profil mis à jour avec succès !');
      }
    } catch (error: any) {
      console.error('Erreur de mise à jour du profil:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  const value = {
    user,
    profile,
    token,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}