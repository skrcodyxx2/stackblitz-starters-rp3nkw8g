import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes. Veuillez vérifier votre fichier .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test connection function to verify Supabase is working
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('company_settings').select('name').limit(1);
    
    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Erreur inattendue lors de la connexion à Supabase:', err);
    return { success: false, error: err };
  }
};