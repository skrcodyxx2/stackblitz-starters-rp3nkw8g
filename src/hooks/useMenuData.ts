import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export function useMenuData() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories (
            name,
            id
          )
        `)
        .eq('is_available', true)
        .order('sort_order');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du menu');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchCategories(), fetchMenuItems()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    categories,
    menuItems,
    loading,
    error,
    refetch: fetchData
  };
}