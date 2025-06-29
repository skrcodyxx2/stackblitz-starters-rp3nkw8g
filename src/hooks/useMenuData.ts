import { useState, useEffect } from 'react';
import type { MenuCategory, MenuItem } from '../lib/database';

export function useMenuData() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories');
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
      
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/items');
      if (!response.ok) throw new Error('Erreur lors du chargement du menu');
      
      const data = await response.json();
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