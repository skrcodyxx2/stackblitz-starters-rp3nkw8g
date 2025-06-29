/**
 * Service d'authentification pour Dounie Cuisine Pro
 * Ce module gère l'authentification avec PostgreSQL et JWT
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './database.js';
import toast from 'react-hot-toast';

// Configuration
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'votre_secret_jwt_tres_securise';
const JWT_EXPIRY = import.meta.env.VITE_JWT_EXPIRY || '7d';

// Fonction pour générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role || 'client'
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRY }
  );
};

// Fonction pour vérifier un token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Erreur de vérification JWT:', error);
    return null;
  }
};

// Fonction pour hacher un mot de passe
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Fonction pour vérifier un mot de passe
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Fonction pour s'inscrire
export const signUp = async (email, password, userData) => {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.data && existingUser.data.length > 0) {
      return { data: null, error: { message: 'Cet email est déjà utilisé' } };
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Insérer l'utilisateur
    const result = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    if (result.error) {
      throw result.error;
    }

    const user = result.data[0];

    // Insérer le profil
    const profileResult = await query(
      'INSERT INTO profiles (id, email, first_name, last_name, role, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        user.id,
        email,
        userData.first_name || '',
        userData.last_name || '',
        'client',
        true
      ]
    );

    if (profileResult.error) {
      throw profileResult.error;
    }

    // Générer un token
    const token = generateToken({ ...user, role: 'client' });

    return {
      data: {
        user: { ...user, role: 'client' },
        token
      },
      error: null
    };
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return { data: null, error: { message: error.message || 'Erreur lors de l\'inscription' } };
  }
};

// Fonction pour se connecter
export const signIn = async (email, password) => {
  try {
    // Récupérer l'utilisateur
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.error) {
      throw userResult.error;
    }

    if (!userResult.data || userResult.data.length === 0) {
      return { data: null, error: { message: 'Email ou mot de passe incorrect' } };
    }

    const user = userResult.data[0];

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return { data: null, error: { message: 'Email ou mot de passe incorrect' } };
    }

    // Récupérer le profil
    const profileResult = await query('SELECT * FROM profiles WHERE id = $1', [user.id]);
    
    if (profileResult.error) {
      throw profileResult.error;
    }

    if (!profileResult.data || profileResult.data.length === 0) {
      return { data: null, error: { message: 'Profil utilisateur non trouvé' } };
    }

    const profile = profileResult.data[0];

    // Vérifier si le compte est actif
    if (!profile.is_active) {
      return { data: null, error: { message: 'Ce compte a été désactivé' } };
    }

    // Générer un token
    const token = generateToken({ ...user, role: profile.role });

    // Créer une session
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 jours
    );

    return {
      data: {
        user: { id: user.id, email: user.email, role: profile.role },
        profile,
        token
      },
      error: null
    };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return { data: null, error: { message: error.message || 'Erreur lors de la connexion' } };
  }
};

// Fonction pour se déconnecter
export const signOut = async (token) => {
  try {
    // Supprimer la session
    await query('DELETE FROM sessions WHERE token = $1', [token]);
    return { data: true, error: null };
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return { data: null, error: { message: error.message || 'Erreur lors de la déconnexion' } };
  }
};

// Fonction pour récupérer l'utilisateur actuel
export const getCurrentUser = async (token) => {
  try {
    if (!token) {
      return { data: null, error: { message: 'Token non fourni' } };
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    if (!decoded) {
      return { data: null, error: { message: 'Token invalide ou expiré' } };
    }

    // Vérifier si la session existe
    const sessionResult = await query('SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()', [token]);
    
    if (sessionResult.error) {
      throw sessionResult.error;
    }

    if (!sessionResult.data || sessionResult.data.length === 0) {
      return { data: null, error: { message: 'Session expirée ou invalide' } };
    }

    // Récupérer l'utilisateur
    const userResult = await query('SELECT id, email, created_at FROM users WHERE id = $1', [decoded.id]);
    
    if (userResult.error) {
      throw userResult.error;
    }

    if (!userResult.data || userResult.data.length === 0) {
      return { data: null, error: { message: 'Utilisateur non trouvé' } };
    }

    const user = userResult.data[0];

    // Récupérer le profil
    const profileResult = await query('SELECT * FROM profiles WHERE id = $1', [user.id]);
    
    if (profileResult.error) {
      throw profileResult.error;
    }

    if (!profileResult.data || profileResult.data.length === 0) {
      return { data: null, error: { message: 'Profil utilisateur non trouvé' } };
    }

    const profile = profileResult.data[0];

    // Vérifier si le compte est actif
    if (!profile.is_active) {
      return { data: null, error: { message: 'Ce compte a été désactivé' } };
    }

    return {
      data: {
        user: { id: user.id, email: user.email, role: profile.role },
        profile
      },
      error: null
    };
  } catch (error) {
    console.error('Erreur de récupération de l\'utilisateur:', error);
    return { data: null, error: { message: error.message || 'Erreur lors de la récupération de l\'utilisateur' } };
  }
};

// Fonction pour mettre à jour le profil
export const updateProfile = async (userId, updates, token) => {
  try {
    // Vérifier le token
    const decoded = verifyToken(token);
    if (!decoded || decoded.id !== userId) {
      return { data: null, error: { message: 'Non autorisé' } };
    }

    // Mettre à jour le profil
    const result = await query(
      'UPDATE profiles SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [updates.first_name, updates.last_name, updates.phone, userId]
    );

    if (result.error) {
      throw result.error;
    }

    if (!result.data || result.data.length === 0) {
      return { data: null, error: { message: 'Profil non trouvé' } };
    }

    return { data: result.data[0], error: null };
  } catch (error) {
    console.error('Erreur de mise à jour du profil:', error);
    return { data: null, error: { message: error.message || 'Erreur lors de la mise à jour du profil' } };
  }
};

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  updateProfile,
  generateToken,
  verifyToken
};