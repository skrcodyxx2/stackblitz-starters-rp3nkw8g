/**
 * Configuration de base de données pour Dounie Cuisine Pro
 * Ce module gère la connexion à la base de données SQLite locale
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import toast from 'react-hot-toast';

// Obtenir le chemin du fichier actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin de la base de données
const DB_PATH = path.join(__dirname, '..', '..', 'database.sqlite');

// Vérifier si la base de données existe
if (!fs.existsSync(DB_PATH)) {
  console.warn('Base de données non trouvée. Veuillez exécuter npm run db:setup et npm run db:seed');
}

// Créer une instance de la base de données
let db;
try {
  db = new Database(DB_PATH, { fileMustExist: true });
  db.pragma('foreign_keys = ON');
  console.log('✅ Connexion à la base de données SQLite établie');
} catch (error) {
  console.error('❌ Erreur lors de la connexion à la base de données:', error.message);
  toast.error('Erreur de base de données. Veuillez contacter l\'administrateur.');
}

// Fonction pour tester la connexion
export const testConnection = () => {
  try {
    if (!db) {
      console.error('❌ Base de données non initialisée');
      return { success: false, error: 'Base de données non initialisée' };
    }
    
    const result = db.prepare('SELECT 1 as test').get();
    console.log('✅ Test de connexion à la base de données réussi:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Erreur lors du test de la base de données:', error.message);
    return { success: false, error: error.message };
  }
};

// Fonction pour exécuter une requête
export const query = (sql, params = []) => {
  try {
    if (!db) {
      throw new Error('Base de données non initialisée');
    }
    
    const stmt = db.prepare(sql);
    
    if (sql.trim().toLowerCase().startsWith('select')) {
      // Pour les requêtes SELECT
      if (sql.toLowerCase().includes('limit 1')) {
        // Pour les requêtes qui retournent un seul résultat
        const result = stmt.get(...params);
        return { data: result, error: null };
      } else {
        // Pour les requêtes qui retournent plusieurs résultats
        const result = stmt.all(...params);
        return { data: result, error: null };
      }
    } else {
      // Pour les requêtes INSERT, UPDATE, DELETE
      const result = stmt.run(...params);
      return { data: result, error: null };
    }
  } catch (error) {
    console.error('❌ Erreur de requête SQL:', error.message, 'SQL:', sql, 'Params:', params);
    return { data: null, error };
  }
};

// Fonction pour exécuter une transaction
export const transaction = (callback) => {
  try {
    if (!db) {
      throw new Error('Base de données non initialisée');
    }
    
    const result = db.transaction(callback)();
    return { data: result, error: null };
  } catch (error) {
    console.error('❌ Erreur de transaction:', error.message);
    return { data: null, error };
  }
};

// Fonction pour fermer la connexion
export const closeDatabase = () => {
  if (db) {
    db.close();
    console.log('✅ Connexion à la base de données fermée');
  }
};

// Exporter les fonctions
export default {
  query,
  transaction,
  testConnection,
  closeDatabase
};