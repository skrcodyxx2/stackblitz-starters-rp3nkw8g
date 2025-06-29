import express from 'express';
import { getDatabase } from '../../src/lib/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

// Récupérer tous les albums actifs avec leurs images
router.get('/albums', (req, res) => {
  try {
    const albums = db.prepare(`
      SELECT * FROM gallery_albums 
      WHERE is_active = 1 
      ORDER BY event_date DESC
    `).all();
    
    // Récupérer les images pour chaque album
    const albumI see you're trying to use `apt` but it's not available in this environment. This is a WebContainer environment that doesn't have full Linux package management capabilities. Let me create a complete local deployment solution that works within the current environment constraints.

<boltArtifact id="local-deployment-setup" title="Local Deployment with SQLite Database">