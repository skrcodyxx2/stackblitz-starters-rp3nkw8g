/**
 * Service API pour Dounie Cuisine Pro
 * Ce module fournit des fonctions pour interagir avec l'API PostgreSQL
 */

import { query } from './database.js';
import toast from 'react-hot-toast';

// Fonction générique pour gérer les erreurs
const handleError = (error, fallbackMessage = 'Une erreur est survenue') => {
  console.error('Erreur API:', error);
  
  let errorMessage = fallbackMessage;
  
  if (error?.message) {
    errorMessage = error.message;
  }
  
  toast.error(errorMessage);
  return errorMessage;
};

// Fonctions pour les catégories de menu
export const menuCategoriesApi = {
  getAll: async () => {
    try {
      const result = await query(
        'SELECT * FROM menu_categories WHERE is_active = true ORDER BY sort_order'
      );
      
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des catégories') };
    }
  },
  
  getById: async (id) => {
    try {
      const result = await query(
        'SELECT * FROM menu_categories WHERE id = $1',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0] || null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement de la catégorie') };
    }
  },
  
  create: async (category) => {
    try {
      const result = await query(
        'INSERT INTO menu_categories (name, description, image_url, sort_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [category.name, category.description, category.image_url, category.sort_order || 0, category.is_active !== false]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la création de la catégorie') };
    }
  },
  
  update: async (id, updates) => {
    try {
      const result = await query(
        'UPDATE menu_categories SET name = $1, description = $2, image_url = $3, sort_order = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
        [updates.name, updates.description, updates.image_url, updates.sort_order, updates.is_active, id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la mise à jour de la catégorie') };
    }
  },
  
  delete: async (id) => {
    try {
      const result = await query(
        'DELETE FROM menu_categories WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la suppression de la catégorie') };
    }
  }
};

// Fonctions pour les plats du menu
export const menuItemsApi = {
  getAll: async () => {
    try {
      const result = await query(`
        SELECT m.*, c.name as category_name 
        FROM menu_items m
        LEFT JOIN menu_categories c ON m.category_id = c.id
        WHERE m.is_available = true
        ORDER BY m.sort_order
      `);
      
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des plats') };
    }
  },
  
  getById: async (id) => {
    try {
      const result = await query(
        'SELECT * FROM menu_items WHERE id = $1',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0] || null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement du plat') };
    }
  },
  
  getByCategory: async (categoryId) => {
    try {
      const result = await query(
        'SELECT * FROM menu_items WHERE category_id = $1 AND is_available = true ORDER BY sort_order',
        [categoryId]
      );
      
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des plats de la catégorie') };
    }
  },
  
  create: async (item) => {
    try {
      const result = await query(
        `INSERT INTO menu_items (
          category_id, name, description, price, image_url, 
          ingredients, allergens, preparation_time, calories, 
          is_available, is_festive, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          item.category_id, item.name, item.description, item.price, item.image_url,
          item.ingredients, item.allergens, item.preparation_time, item.calories,
          item.is_available !== false, item.is_festive || false, item.sort_order || 0
        ]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la création du plat') };
    }
  },
  
  update: async (id, updates) => {
    try {
      const result = await query(
        `UPDATE menu_items SET 
          category_id = $1, name = $2, description = $3, price = $4, image_url = $5,
          ingredients = $6, allergens = $7, preparation_time = $8, calories = $9,
          is_available = $10, is_festive = $11, sort_order = $12, updated_at = NOW()
        WHERE id = $13 RETURNING *`,
        [
          updates.category_id, updates.name, updates.description, updates.price, updates.image_url,
          updates.ingredients, updates.allergens, updates.preparation_time, updates.calories,
          updates.is_available, updates.is_festive, updates.sort_order, id
        ]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la mise à jour du plat') };
    }
  },
  
  delete: async (id) => {
    try {
      const result = await query(
        'DELETE FROM menu_items WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la suppression du plat') };
    }
  }
};

// Fonctions pour les paramètres de l'entreprise
export const companySettingsApi = {
  get: async () => {
    try {
      const result = await query('SELECT * FROM company_settings LIMIT 1');
      
      if (result.error) throw result.error;
      return { data: result.data[0] || null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des paramètres') };
    }
  },
  
  update: async (updates) => {
    try {
      // Vérifier si des paramètres existent déjà
      const existingResult = await query('SELECT id FROM company_settings LIMIT 1');
      
      if (existingResult.error) throw existingResult.error;
      
      let result;
      
      if (existingResult.data && existingResult.data.length > 0) {
        // Mettre à jour les paramètres existants
        result = await query(
          `UPDATE company_settings SET 
            name = $1, slogan = $2, description = $3, address = $4, phone = $5,
            email = $6, website = $7, logo_url = $8, favicon_url = $9, hero_title = $10,
            hero_subtitle = $11, hero_image_url = $12, tax_tps = $13, tax_tvq = $14,
            business_hours = $15, social_media = $16, privacy_policy = $17,
            terms_of_service = $18, about_us = $19, updated_at = NOW()
          WHERE id = $20 RETURNING *`,
          [
            updates.name, updates.slogan, updates.description, updates.address, updates.phone,
            updates.email, updates.website, updates.logo_url, updates.favicon_url, updates.hero_title,
            updates.hero_subtitle, updates.hero_image_url, updates.tax_tps, updates.tax_tvq,
            updates.business_hours, updates.social_media, updates.privacy_policy,
            updates.terms_of_service, updates.about_us, existingResult.data[0].id
          ]
        );
      } else {
        // Créer de nouveaux paramètres
        result = await query(
          `INSERT INTO company_settings (
            name, slogan, description, address, phone, email, website, logo_url, favicon_url,
            hero_title, hero_subtitle, hero_image_url, tax_tps, tax_tvq, business_hours,
            social_media, privacy_policy, terms_of_service, about_us
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
          [
            updates.name, updates.slogan, updates.description, updates.address, updates.phone,
            updates.email, updates.website, updates.logo_url, updates.favicon_url, updates.hero_title,
            updates.hero_subtitle, updates.hero_image_url, updates.tax_tps, updates.tax_tvq,
            updates.business_hours, updates.social_media, updates.privacy_policy,
            updates.terms_of_service, updates.about_us
          ]
        );
      }
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la mise à jour des paramètres') };
    }
  }
};

// Fonctions pour les albums de galerie
export const galleryAlbumsApi = {
  getAll: async () => {
    try {
      const result = await query(
        'SELECT * FROM gallery_albums WHERE is_active = true ORDER BY event_date DESC'
      );
      
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des albums') };
    }
  },
  
  getWithImages: async () => {
    try {
      const albumsResult = await query(
        'SELECT * FROM gallery_albums WHERE is_active = true ORDER BY event_date DESC'
      );
      
      if (albumsResult.error) throw albumsResult.error;
      
      const albums = albumsResult.data;
      
      // Pour chaque album, récupérer les images
      for (const album of albums) {
        const imagesResult = await query(
          'SELECT * FROM gallery_images WHERE album_id = $1 ORDER BY sort_order',
          [album.id]
        );
        
        if (imagesResult.error) throw imagesResult.error;
        
        album.gallery_images = imagesResult.data;
      }
      
      return { data: albums, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des albums avec images') };
    }
  },
  
  getById: async (id) => {
    try {
      const albumResult = await query(
        'SELECT * FROM gallery_albums WHERE id = $1',
        [id]
      );
      
      if (albumResult.error) throw albumResult.error;
      
      if (!albumResult.data || albumResult.data.length === 0) {
        return { data: null, error: { message: 'Album non trouvé' } };
      }
      
      const album = albumResult.data[0];
      
      // Récupérer les images de l'album
      const imagesResult = await query(
        'SELECT * FROM gallery_images WHERE album_id = $1 ORDER BY sort_order',
        [id]
      );
      
      if (imagesResult.error) throw imagesResult.error;
      
      album.gallery_images = imagesResult.data;
      
      return { data: album, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement de l\'album') };
    }
  },
  
  create: async (album) => {
    try {
      const result = await query(
        'INSERT INTO gallery_albums (name, description, cover_image_url, event_date, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [album.name, album.description, album.cover_image_url, album.event_date, album.is_active !== false]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la création de l\'album') };
    }
  },
  
  update: async (id, updates) => {
    try {
      const result = await query(
        'UPDATE gallery_albums SET name = $1, description = $2, cover_image_url = $3, event_date = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
        [updates.name, updates.description, updates.cover_image_url, updates.event_date, updates.is_active, id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la mise à jour de l\'album') };
    }
  },
  
  delete: async (id) => {
    try {
      const result = await query(
        'DELETE FROM gallery_albums WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la suppression de l\'album') };
    }
  }
};

// Fonctions pour les images de galerie
export const galleryImagesApi = {
  getByAlbumId: async (albumId) => {
    try {
      const result = await query(
        'SELECT * FROM gallery_images WHERE album_id = $1 ORDER BY sort_order',
        [albumId]
      );
      
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des images') };
    }
  },
  
  create: async (image) => {
    try {
      const result = await query(
        'INSERT INTO gallery_images (album_id, image_url, caption, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [image.album_id, image.image_url, image.caption, image.sort_order || 0]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la création de l\'image') };
    }
  },
  
  update: async (id, updates) => {
    try {
      const result = await query(
        'UPDATE gallery_images SET image_url = $1, caption = $2, sort_order = $3 WHERE id = $4 RETURNING *',
        [updates.image_url, updates.caption, updates.sort_order, id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la mise à jour de l\'image') };
    }
  },
  
  delete: async (id) => {
    try {
      const result = await query(
        'DELETE FROM gallery_images WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la suppression de l\'image') };
    }
  }
};

// Fonctions pour les utilisateurs et profils
export const usersApi = {
  getAll: async () => {
    try {
      const result = await query(`
        SELECT p.*, u.created_at as user_created_at
        FROM profiles p
        JOIN users u ON p.id = u.id
        ORDER BY p.created_at DESC
      `);
      
      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement des utilisateurs') };
    }
  },
  
  getById: async (id) => {
    try {
      const result = await query(
        'SELECT * FROM profiles WHERE id = $1',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0] || null, error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors du chargement de l\'utilisateur') };
    }
  },
  
  update: async (id, updates) => {
    try {
      const result = await query(
        'UPDATE profiles SET first_name = $1, last_name = $2, phone = $3, role = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
        [updates.first_name, updates.last_name, updates.phone, updates.role, updates.is_active, id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la mise à jour de l\'utilisateur') };
    }
  },
  
  delete: async (id) => {
    try {
      // Supprimer l'utilisateur (la suppression en cascade supprimera le profil)
      const result = await query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.error) throw result.error;
      return { data: result.data[0], error: null };
    } catch (error) {
      return { data: null, error: handleError(error, 'Erreur lors de la suppression de l\'utilisateur') };
    }
  }
};

// Exporter toutes les API
export default {
  menuCategories: menuCategoriesApi,
  menuItems: menuItemsApi,
  companySettings: companySettingsApi,
  galleryAlbums: galleryAlbumsApi,
  galleryImages: galleryImagesApi,
  users: usersApi
};