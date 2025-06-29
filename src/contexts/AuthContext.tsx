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

  const fetchProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3;
    const timeoutDuration = 10000; // Reduced to 10 seconds
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutDuration)
      );

      // Create fetch promise with AbortController for better timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .abortSignal(controller.signal)
        .single();
      
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Clear timeout if request completes
      clearTimeout(timeoutId);
      
      if (result.error) {
        console.error('Error fetching profile:', result.error);
        
        // Handle specific Supabase errors
        if (result.error.code === 'PGRST116') {
          // No rows returned - profile doesn't exist
          console.warn('Profile not found for user:', userId);
          setProfile(null);
          return;
        }
        
        throw result.error;
      }
      
      setProfile(result.data);
      console.log("Profile loaded:", result.data);
    } catch (error) {
      console.error(`Error fetching profile (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for network errors and timeouts
      if (retryCount < maxRetries && 
          (error instanceof Error && 
           (error.message === 'Request timeout' || 
            error.message.includes('fetch') ||
            error.name === 'AbortError'))) {
        
        console.log(`Retrying profile fetch in ${(retryCount + 1) * 2} seconds...`);
        
        setTimeout(() => {
          fetchProfile(userId, retryCount + 1);
        }, (retryCount + 1) * 2000); // Exponential backoff: 2s, 4s, 6s
        
        return;
      }
      
      // Handle different error types for final attempt
      if (error instanceof Error) {
        if (error.message === 'Request timeout' || error.name === 'AbortError') {
          toast.error('La connexion prend trop de temps. Veuillez rafraîchir la page.');
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          toast.error('Problème de connexion réseau. Vérifiez votre connexion internet.');
        } else {
          toast.error('Erreur lors du chargement du profil. Veuillez réessayer.');
        }
      }
      
      // Set profile to null on final failure to prevent infinite loading
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Sign in successful:", data);
      
      // Set user metadata for admin users to avoid RLS recursion issues
      if (email === 'vfreud@yahoo.com' && data.user) {
        try {
          // Update user metadata to include role
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
          
          // Also ensure profile has admin role
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              role: 'admin',
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
            
          if (profileError) {
            console.error("Error updating admin role:", profileError);
          }
        } catch (metadataError) {
          console.error("Error updating user metadata:", metadataError);
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: 'client' // Always set role in metadata for new users
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Profile should be created by the trigger, but we'll check and create if needed
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (!existingProfile) {
          // Create profile manually if trigger failed
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email,
              role: 'client',
              ...userData,
            });
          
          if (profileError) throw profileError;
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile
      await fetchProfile(user.id);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
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