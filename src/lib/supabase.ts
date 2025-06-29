import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables d\'environnement Supabase manquantes. Veuillez vérifier votre fichier .env');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Défini' : 'Manquant');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Défini' : 'Manquant');
  throw new Error('Variables d\'environnement Supabase manquantes. Veuillez vérifier votre fichier .env');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('URL Supabase invalide:', supabaseUrl);
  throw new Error('URL Supabase invalide. Veuillez vérifier VITE_SUPABASE_URL dans votre fichier .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'dounie-cuisine-pro@1.0.0',
    },
  },
  // Add request timeout
  fetch: (url, options) => {
    const controller = new AbortController();
    const { signal } = controller;
    
    // Set timeout to 15 seconds
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    return fetch(url, { ...options, signal })
      .then(response => {
        clearTimeout(timeoutId);
        return response;
      })
      .catch(error => {
        clearTimeout(timeoutId);
        throw error;
      });
  }
});

// Test connection function to verify Supabase is working
export const testSupabaseConnection = async () => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    );

    const fetchPromise = supabase.from('company_settings').select('name').limit(1);
    
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return { success: false, error };
    }
    
    console.log('Connexion Supabase réussie');
    return { success: true, data };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Connection timeout') {
        console.error('Timeout de connexion à Supabase');
        return { success: false, error: { message: 'Connection timeout' } };
      } else if (err.message.includes('fetch')) {
        console.error('Erreur réseau lors de la connexion à Supabase:', err);
        return { success: false, error: { message: 'Network error' } };
      }
    }
    console.error('Erreur inattendue lors de la connexion à Supabase:', err);
    return { success: false, error: err };
  }
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development';
};

// Initialize connection test on app start
if (isDevelopment()) {
  console.log('Testing Supabase connection...');
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase connection successful');
    } else {
      console.warn('⚠️ Supabase connection failed:', result.error);
      console.log('Using the following Supabase URL:', supabaseUrl);
    }
  });
}