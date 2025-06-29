import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import toast from 'react-hot-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const MAX_RETRIES = 3;
    const INITIAL_TIMEOUT = 30000; // 30 seconds
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Fetching profile for user ${userId} (attempt ${attempt}/${MAX_RETRIES})`);
        
        // Create an AbortController with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, INITIAL_TIMEOUT);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
          .abortSignal(controller.signal);
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (error) {
          console.error(`Error fetching profile (attempt ${attempt}):`, error);
          
          if (attempt === MAX_RETRIES) {
            // On final attempt, show error to user
            toast.error('Problème de connexion à votre profil. Veuillez réessayer plus tard.');
            throw error;
          }
          
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        return; // Success, exit the retry loop
      } catch (error: any) {
        console.error(`Error fetching profile (attempt ${attempt}):`, error);
        
        if (attempt === MAX_RETRIES) {
          // On final attempt, continue with app but show warning
          toast.error('Impossible de charger votre profil. Certaines fonctionnalités peuvent être limitées.');
        } else {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
      }
    }
    
    // Even if profile fetch fails, we should still allow the app to load
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: 'client'
        }
      }
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Profile will be created by the database trigger
      toast.success('Compte créé avec succès!');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    
    if (error) throw error;
    
    // Refresh profile
    await fetchProfile(user.id);
    toast.success('Profil mis à jour avec succès!');
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