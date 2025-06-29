import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
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
    const timeoutDuration = 30000; // Increased from 20000ms to 30000ms (30 seconds)
    
    try {
      console.log(`Fetching profile for user ${userId} (attempt ${retryCount + 1})`);
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout (attempt ${retryCount + 1})`)), timeoutDuration)
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
        console.error(`Error fetching profile (attempt ${retryCount + 1}):`, result.error);
        
        // Handle specific Supabase errors
        if (result.error.code === 'PGRST116') {
          // No rows returned - profile doesn't exist
          console.warn('Profile not found for user:', userId);
          
          // Try to create profile if it doesn't exist
          try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              console.log('Creating missing profile for user:', userId);
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  email: userData.user.email || '',
                  role: 'client',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                console.error('Error creating profile:', insertError);
              } else {
                console.log('Profile created successfully, retrying fetch');
                // Retry fetch after creating profile
                return fetchProfile(userId, retryCount);
              }
            }
          } catch (createError) {
            console.error('Error creating missing profile:', createError);
          }
          
          setProfile(null);
          setLoading(false);
          return;
        }
        
        throw result.error;
      }
      
      console.log("Profile loaded successfully:", result.data.id);
      setProfile(result.data);
    } catch (error) {
      console.error(`Error fetching profile (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for network errors and timeouts
      if (retryCount < maxRetries && 
          (error instanceof Error && 
           (error.message.includes('Request timeout') || 
            error.message.includes('fetch') ||
            error.name === 'AbortError'))) {
        
        const delayMs = (retryCount + 1) * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`Retrying profile fetch in ${delayMs/1000} seconds...`);
        
        setTimeout(() => {
          fetchProfile(userId, retryCount + 1);
        }, delayMs);
        
        return;
      }
      
      // Handle different error types for final attempt
      if (error instanceof Error) {
        if (error.message.includes('Request timeout') || error.name === 'AbortError') {
          console.warn('Profile fetch timed out after multiple attempts. Continuing without profile data.');
          toast.error('La connexion à la base de données prend trop de temps. Certaines fonctionnalités peuvent être limitées.', {
            duration: 5000
          });
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          console.warn('Network error during profile fetch. Continuing without profile data.');
          toast.error('Problème de connexion réseau. Certaines fonctionnalités peuvent être limitées.', {
            duration: 5000
          });
        } else {
          console.warn('Unknown error during profile fetch. Continuing without profile data.');
          toast.error('Erreur lors du chargement du profil. Veuillez rafraîchir la page.', {
            duration: 5000
          });
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
      
      console.log("Sign in successful");
      
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
      handleSupabaseError(error, 'Erreur de connexion');
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
        try {
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
        } catch (profileError) {
          console.warn("Profile check error (non-critical):", profileError);
          // Continue even if profile check fails - the trigger should handle it
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      handleSupabaseError(error, 'Erreur lors de l\'inscription');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error("Sign out error:", error);
      handleSupabaseError(error, 'Erreur lors de la déconnexion');
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
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error("Update profile error:", error);
      handleSupabaseError(error, 'Erreur lors de la mise à jour du profil');
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