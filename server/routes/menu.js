import express from 'express';
import { getDatabase } from '../../src/lib/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

// Récupérer toutes les catégories actives
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT * FROM menu_categories 
      WHERE is_active = 1 
      ORDER BY sort_order
    `).all();
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les plats disponibles
router.get('/items', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT mi.*, mc.name as category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.is_available = 1
      ORDER BY mi.sort_order
    `).all();
    
    // Parser les JSON strings
    const parsedItems = items.map(item => ({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      allergens: item.allergens ? JSON.parse(item.allergens) : []
    }));
    
    res.json(parsedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les plats par catégorie
router.get('/items/category/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = db.prepare(`
      SELECT * FROM menu_items 
      WHERE category_id = ? AND is_available = 1 
      ORDER BY sort_order
    `).all(categoryId);
    
    // Parser les JSON strings
    const parsedItems = items.map(item => ({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      allergens: item.allergens ? JSON.parse(item.allergens) : []
    }));
    
    res.json(parsedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les menus spéciaux
router.get('/special', (req, res) => {
  try {
    const specialMenus = db.prepare(`
      SELECT * FROM special_menus 
      WHERE is_active = 1 
      ORDER BY sort_order
    `).all();
    
    res.json(specialMenus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes admin pour la gestion du menu
router.use(authMiddleware);

// Créer une catégorie (admin seulement)
router.post('/categories', requireRole(['admin', 'employee']), (req, res) => {
  try {
    const { name, description, image_url, sort_order } = req.body;
    
    const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const insertCategory = db.prepare(`
      INSERT INTO menu_categories (id, name, description, image_url, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertCategory.run(id, name, description, image_url, sort_order || 0);
    
    const category = db.prepare('SELECT * FROM menu_categories WHERE id = ?').get(id);
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Créer un plat (admin seulement)
router.post('/items', requireRole(['admin', 'employee']), (req, res) => {
  try {
    const { 
      category_id, name, description, price, image_url, 
      ingredients, allergens, preparation_time, calories, 
      is_available, is_festive, sort_order 
    } = req.body;
    
    const id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const insertItem = db.prepare(`
      INSERT INTO menu_items (
        id, category_id, name, description, price, image_url,
        ingredients, allergens, preparation_time, calories,
        is_available, is_festive, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertItem.run(
      id, category_id, name, description, price, image_url,
      JSON.stringify(ingredients || []), JSON.stringify(allergens || []),
      preparation_time, calories, is_available ? 1 : 0, is_festive ? 1 : 0, sort_order || 0
    );
    
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mettre à jour un plat
router.put('/items/:id', requireRole(['admin', 'employee']), (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Construire la requête de mise à jour dynamiquement
    const allowedFields = [
      'category_id', 'name', 'description', 'price', 'image_url',
      'ingredients', 'allergens', 'preparation_time', 'calories',
      'is_available', 'is_festive', 'sort_order'
    ];
    
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Aucun champ valide à mettre à jour' });
    }
    
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => {
      if (field === 'ingredients' || field === 'allergens') {
        return JSON.stringify(updates[field] || []);
      }
      if (field === 'is_available' || field === 'is_festive') {
        return updates[field] ? 1 : 0;
      }
      return updates[field];
    });
    values.push(new Date().toISOString(), id);
    
    const updateItem = db.prepare(`
      UPDATE menu_items 
      SET ${setClause}, updated_at = ?
      WHERE id = ?
    `);
    
    updateItem.run(...values);
    
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un plat
router.delete('/items/:id', requireRole(['admin', 'employee']), (req, res) => {
  try {
    const { id } = req.params;
    
    const deleteItem = db.prepare('DELETE FROM menu_items WHERE id = ?');
    const result = deleteItem.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }
    
    res.json({ message: 'Plat supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;