import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from './database';
import type { User, UserSession } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Fonction pour générer un UUID simple
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class AuthService {
  private db = getDatabase();

  async signUp(email: string, password: string, userData: Partial<User> = {}) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userId = generateId();
    const insertUser = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const role = email === 'admin@dounieculisine.ca' ? 'admin' : 'client';

    insertUser.run(
      userId,
      email,
      passwordHash,
      userData.first_name || '',
      userData.last_name || '',
      userData.phone || '',
      role,
      1
    );

    // Récupérer l'utilisateur créé
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
    
    // Créer une session
    const session = await this.createSession(user);

    return { user: this.sanitizeUser(user), session };
  }

  async signIn(email: string, password: string) {
    // Récupérer l'utilisateur
    const user = this.db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as User;
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Créer une session
    const session = await this.createSession(user);

    return { user: this.sanitizeUser(user), session };
  }

  async signOut(token: string) {
    // Supprimer la session
    this.db.prepare('DELETE FROM user_sessions WHERE token = ?').run(token);
  }

  async getUser(token: string) {
    // Vérifier la session
    const session = this.db.prepare(`
      SELECT s.*, u.* FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now') AND u.is_active = 1
    `).get(token) as (UserSession & User);

    if (!session) {
      return null;
    }

    return this.sanitizeUser(session);
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field as keyof User]);
    values.push(new Date().toISOString(), userId);

    const updateUser = this.db.prepare(`
      UPDATE users 
      SET ${setClause}, updated_at = ?
      WHERE id = ?
    `);

    updateUser.run(...values);

    // Récupérer l'utilisateur mis à jour
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
    return this.sanitizeUser(user);
  }

  private async createSession(user: User) {
    const sessionId = generateId();
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

    const insertSession = this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    insertSession.run(sessionId, user.id, token, expiresAt.toISOString());

    return { token, expires_at: expiresAt.toISOString() };
  }

  private sanitizeUser(user: User) {
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Récupérer l'utilisateur
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, must_change_password = 0, updated_at = ?
      WHERE id = ?
    `).run(newPasswordHash, new Date().toISOString(), userId);
  }
}

export const authService = new AuthService();