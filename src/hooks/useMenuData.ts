import { useState, useEffect } from 'react';
import { menuCategoriesApi, menuItemsApi } from '../lib/api.js';
import toast from 'react-hot-toast';

interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MenuItem {
  id: string;
  category_id: string | null;
  category_name?: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  preparation_time: number | null;
  calories: number | null;
  is_available: boolean;
  is_festive: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useMenuData() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data, error } = await menuCategoriesApi.getAll();

      if (error) throw new Error(error);
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await menuItemsApi.getAll();

      if (error) throw new Error(error);
      setMenuItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du menu');
      toast.error('Erreur lors du chargement du menu');
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