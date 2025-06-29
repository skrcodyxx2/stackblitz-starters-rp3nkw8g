import express from 'express';
import { authService } from '../../src/lib/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Inscription
router.post('/signup', async (req, res) => {
  try {
    const { email, password, userData } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const result = await authService.signUp(email, password, userData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Connexion
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const result = await authService.signIn(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Déconnexion
router.post('/signout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await authService.signOut(token);
    }
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer l'utilisateur actuel
router.get('/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

// Mettre à jour le profil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await authService.updateProfile(req.user.id, updates);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Changer le mot de passe
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;