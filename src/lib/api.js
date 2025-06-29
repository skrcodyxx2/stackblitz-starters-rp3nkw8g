/**
 * Service API pour Dounie Cuisine Pro
 * Ce module fournit des fonctions pour interagir avec l'API locale
 */

import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

// Simuler des données pour le développement local
const mockData = {
  companySettings: {
    id: uuidv4(),
    name: 'Dounie Cuisine Pro',
    slogan: 'Saveurs Authentiques Caribéennes',
    description: 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.',
    address: 'Montréal, Québec, Canada',
    phone: '+1 (514) 123-4567',
    email: 'info@dounieculisine.ca',
    website: 'https://dounieculisine.ca',
    hero_title: 'Saveurs Authentiques Caribéennes',
    hero_subtitle: 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
    hero_image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    about_us: 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.'
  },
  
  menuCategories: [
    {
      id: uuidv4(),
      name: 'Entrées',
      description: 'Délicieuses entrées haïtiennes pour commencer votre repas',
      image_url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      sort_order: 1,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Plats Principaux',
      description: 'Nos spécialités haïtiennes authentiques',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      sort_order: 2,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Accompagnements',
      description: 'Riz, légumes et autres accompagnements traditionnels',
      image_url: 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      sort_order: 3,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Desserts',
      description: 'Douceurs caribéennes pour terminer en beauté',
      image_url: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      sort_order: 4,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Boissons',
      description: 'Boissons traditionnelles et rafraîchissantes',
      image_url: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      sort_order: 5,
      is_active: true
    }
  ],
  
  menuItems: [
    {
      id: uuidv4(),
      category_id: '1',
      name: 'Griot Haïtien',
      description: 'Porc mariné et frit, servi avec du riz et des légumes traditionnels',
      price: 25.99,
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      ingredients: ['Porc', 'Épices haïtiennes', 'Ail', 'Citron vert'],
      allergens: [],
      preparation_time: 45,
      calories: 650,
      is_available: true,
      is_festive: false,
      sort_order: 1
    },
    {
      id: uuidv4(),
      category_id: '1',
      name: 'Poulet Créole',
      description: 'Poulet mijoté aux épices créoles avec légumes et riz parfumé',
      price: 22.99,
      image_url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      ingredients: ['Poulet', 'Tomates', 'Oignons', 'Épices créoles'],
      allergens: [],
      preparation_time: 40,
      calories: 580,
      is_available: true,
      is_festive: false,
      sort_order: 2
    }
  ],
  
  galleryAlbums: [
    {
      id: uuidv4(),
      name: 'Mariage de Marie et Jean',
      description: 'Magnifique célébration de mariage avec 120 invités dans un cadre enchanteur',
      cover_image_url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      event_date: '2024-06-15',
      is_active: true,
      gallery_images: [
        {
          id: uuidv4(),
          image_url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
          caption: 'Table d\'honneur magnifiquement dressée avec décoration florale',
          sort_order: 1
        },
        {
          id: uuidv4(),
          image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
          caption: 'Buffet de plats haïtiens traditionnels avec griot et riz collé',
          sort_order: 2
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Événement Corporatif ABC Inc',
      description: 'Réception d\'entreprise avec service traiteur complet et animation professionnelle',
      cover_image_url: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      event_date: '2024-04-10',
      is_active: true,
      gallery_images: [
        {
          id: uuidv4(),
          image_url: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
          caption: 'Service cocktail professionnel avec canapés',
          sort_order: 1
        }
      ]
    }
  ]
};

// Fonctions API
export const apiService = {
  // Paramètres de l'entreprise
  getCompanySettings: () => {
    return mockData.companySettings;
  },
  
  // Catégories de menu
  getMenuCategories: (activeOnly = true) => {
    let categories = mockData.menuCategories;
    if (activeOnly) {
      categories = categories.filter(cat => cat.is_active);
    }
    return categories;
  },
  
  // Plats du menu
  getMenuItems: (availableOnly = true) => {
    let items = mockData.menuItems;
    if (availableOnly) {
      items = items.filter(item => item.is_available);
    }
    return items;
  },
  
  getMenuItemsByCategory: (categoryId, availableOnly = true) => {
    let items = mockData.menuItems.filter(item => item.category_id === categoryId);
    if (availableOnly) {
      items = items.filter(item => item.is_available);
    }
    return items;
  },
  
  // Albums de galerie
  getGalleryAlbums: (activeOnly = true) => {
    let albums = mockData.galleryAlbums;
    if (activeOnly) {
      albums = albums.filter(album => album.is_active);
    }
    return albums;
  },
  
  getGalleryAlbumsWithImages: (activeOnly = true) => {
    let albums = mockData.galleryAlbums;
    if (activeOnly) {
      albums = albums.filter(album => album.is_active);
    }
    return albums;
  },
  
  // Fonctions d'administration
  createMenuItem: (item) => {
    const newItem = {
      id: uuidv4(),
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockData.menuItems.push(newItem);
    return newItem;
  },
  
  updateMenuItem: (id, updates) => {
    const index = mockData.menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
      mockData.menuItems[index] = {
        ...mockData.menuItems[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      return mockData.menuItems[index];
    }
    return null;
  },
  
  deleteMenuItem: (id) => {
    const index = mockData.menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
      mockData.menuItems.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Fonction pour simuler une requête API
export const fetchApi = async (endpoint, options = {}) => {
  try {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simuler une erreur aléatoire (pour tester la gestion des erreurs)
    if (Math.random() < 0.05) {
      throw new Error('Erreur réseau simulée');
    }
    
    // Traiter la requête en fonction de l'endpoint
    switch (endpoint) {
      case '/api/company/settings':
        return { data: apiService.getCompanySettings(), error: null };
      
      case '/api/menu/categories':
        return { data: apiService.getMenuCategories(), error: null };
      
      case '/api/menu/items':
        return { data: apiService.getMenuItems(), error: null };
      
      case '/api/gallery/albums':
        return { data: apiService.getGalleryAlbums(), error: null };
      
      default:
        throw new Error(`Endpoint non reconnu: ${endpoint}`);
    }
  } catch (error) {
    console.error('Erreur API:', error);
    toast.error('Erreur lors de la communication avec le serveur');
    return { data: null, error };
  }
};

export default apiService;