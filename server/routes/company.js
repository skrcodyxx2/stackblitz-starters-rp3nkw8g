import express from 'express';
import { getDatabase } from '../../src/lib/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

// Récupérer les paramètres de l'entreprise (public)
router.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    
    if (!settings) {
      return res.status(404).json({ message: 'Paramètres non trouvés' });
    }
    
    // Parser les JSON strings
    const parsedSettings = {
      ...settings,
      business_hours: settings.business_hours ? JSON.parse(settings.business_hours) : {},
      social_media: settings.social_media ? JSON.parse(settings.social_media) : {}
    };
    
    res.json(parsedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes admin pour la gestion des paramètres
router.use(authMiddleware);

// Mettre à jour les paramètres de l'entreprise (admin seulement)
router.put('/settings', requireRole(['admin']), (req, res) => {
  try {
    const updates = req.body;
    
    // Champs autorisés à être mis à jour
    const allowedFields = [
      'name', 'slogan', 'description', 'address', 'phone', 'email', 'website',
      'logo_url', 'favicon_url', 'hero_title', 'hero_subtitle', 'hero_image_url',
      'tax_tps', 'tax_tvq', 'business_hours', 'social_media',
      'privacy_policy', 'terms_of_service', 'about_us'
    ];
    
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Aucun champ valide à mettre à jour' });
    }
    
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => {
      if (field === 'business_hours' || field === 'social_media') {
        return JSON.stringify(updates[field] || {});
      }
      return updates[field];
    });
    values.push(new Date().toISOString());
    
    const updateSettings = db.prepare(`
      UPDATE company_settings 
      SET ${setClause}, updated_at = ?
    `);
    
    updateSettings.run(...values);
    
    // Récupérer les paramètres mis à jour
    const settings = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    const parsedSettings = {
      ...settings,
      business_hours: settings.business_hours ? JSON.parse(settings.business_hours) : {},
      social_media: settings.social_media ? JSON.parse(settings.social_media) : {}
    };
    
    res.json(parsedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;