import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import toast from 'react-hot-toast';

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
  // Add reasonable timeouts to prevent hanging requests
  realtime: {
    timeout: 5000, // 5 seconds
  },
  db: {
    schema: 'public'
  }
});

// Test connection function to verify Supabase is working
export const testSupabaseConnection = async () => {
  try {
    // Reduce timeout to 3 seconds to prevent long blocking
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de connexion à Supabase')), 3000)
    );

    const fetchPromise = supabase.from('company_settings').select('name').limit(1);
    
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    
    if ('error' in result && result.error) {
      console.warn('Erreur de connexion Supabase:', result.error);
      return { success: false, error: result.error };
    }
    
    console.log('Connexion Supabase réussie');
    return { success: true, data: result.data };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Timeout de connexion à Supabase') {
        console.warn('Timeout de connexion à Supabase - l\'application continuera de fonctionner');
        return { success: false, error: { message: 'Timeout de connexion à Supabase' } };
      } else if (err.message.includes('fetch')) {
        console.warn('Erreur réseau lors de la connexion à Supabase:', err);
        return { success: false, error: { message: 'Erreur réseau' } };
      }
    }
    console.warn('Erreur lors de la connexion à Supabase:', err);
    return { success: false, error: err };
  }
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development';
};

// Initialize connection test on app start (non-blocking)
if (isDevelopment()) {
  console.log('Testing Supabase connection...');
  // Use setTimeout to make this non-blocking
  setTimeout(() => {
    testSupabaseConnection().then(result => {
      if (result.success) {
        console.log('✅ Supabase connection successful');
      } else {
        console.warn('⚠️ Supabase connection test failed:', result.error);
        console.log('L\'application continuera de fonctionner. Vérifiez votre connexion réseau et les paramètres Supabase.');
        console.log('URL Supabase utilisée:', supabaseUrl);
        
        // Show a toast notification to the user
        toast.error('Problème de connexion à la base de données. Certaines fonctionnalités peuvent être limitées.', {
          duration: 5000,
          position: 'top-center'
        });
      }
    }).catch(err => {
      console.warn('⚠️ Erreur lors du test de connexion Supabase:', err);
      console.log('L\'application continuera de fonctionner.');
    });
  }, 100);
}

// Helper function to handle Supabase errors gracefully
export const handleSupabaseError = (error: any, fallbackMessage = 'Une erreur est survenue') => {
  console.error('Supabase error:', error);
  
  // Determine appropriate error message
  let errorMessage = fallbackMessage;
  
  if (error?.message) {
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      errorMessage = 'La requête a pris trop de temps. Veuillez réessayer.';
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
    } else if (error.message.includes('JWT')) {
      errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    } else if (error.message.includes('permission') || error.message.includes('not authorized')) {
      errorMessage = 'Vous n\'avez pas les permissions nécessaires pour cette action.';
    } else if (error.message.includes('not found')) {
      errorMessage = 'La ressource demandée n\'existe pas.';
    } else if (error.message.includes('already exists')) {
      errorMessage = 'Cette ressource existe déjà.';
    } else if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Email ou mot de passe incorrect.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Veuillez confirmer votre email avant de vous connecter.';
    } else {
      // Use the actual error message if it's informative
      errorMessage = error.message;
    }
  }
  
  // Show toast notification
  toast.error(errorMessage, {
    duration: 4000,
    position: 'top-center'
  });
  
  return errorMessage;
};

// Helper function to create a timeout promise
export const createTimeout = (ms: number) => {
  return new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
};

// Helper function to safely fetch data with timeout
export const safeFetch = async <T>(
  fetchPromise: Promise<{ data: T | null; error: any }>,
  timeoutMs = 5000,
  fallbackData: T | null = null
): Promise<{ data: T | null; error: any }> => {
  try {
    const timeoutPromise = createTimeout(timeoutMs);
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    return result as { data: T | null; error: any };
  } catch (error) {
    console.error('Error in safeFetch:', error);
    return { data: fallbackData, error };
  }
};