/**
 * Configuration PostgreSQL pour Dounie Cuisine Pro
 * Ce module gère la connexion à la base de données PostgreSQL locale
 */

import pg from 'pg';
import toast from 'react-hot-toast';

// Configuration de la connexion
const config = {
  host: import.meta.env.VITE_PG_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_PG_PORT || '5432'),
  database: import.meta.env.VITE_PG_DATABASE || 'dounie_cuisine',
  user: import.meta.env.VITE_PG_USER || 'dounie_user',
  password: import.meta.env.VITE_PG_PASSWORD || 'dounie_password',
  ssl: import.meta.env.VITE_PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Taille maximale du pool de connexions
  idleTimeoutMillis: 30000, // Temps d'inactivité avant de fermer une connexion
  connectionTimeoutMillis: 10000, // Temps d'attente pour une connexion
};

// Créer un pool de connexions
const pool = new pg.Pool(config);

// Événements du pool
pool.on('connect', () => {
  console.log('Nouvelle connexion PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('Erreur PostgreSQL inattendue:', err);
  toast.error('Problème de connexion à la base de données');
});

// Fonction pour tester la connexion
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Connexion PostgreSQL réussie:', result.rows[0]);
    return { success: true, data: result.rows[0] };
  } catch (err) {
    console.error('Erreur de connexion PostgreSQL:', err);
    toast.error('Impossible de se connecter à la base de données');
    return { success: false, error: err };
  }
};

// Fonction pour exécuter une requête
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Requête exécutée', { text, duration, rows: res.rowCount });
    return { data: res.rows, error: null };
  } catch (err) {
    const duration = Date.now() - start;
    console.error('Erreur de requête', { text, duration, error: err });
    return { data: null, error: err };
  }
};

// Fonction pour obtenir un client du pool
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Remplacer la méthode release pour logger les requêtes longues
  client.release = () => {
    release.apply(client);
    console.log('Client PostgreSQL libéré');
  };
  
  // Remplacer la méthode query pour logger les requêtes
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await query.apply(client, [text, params]);
      const duration = Date.now() - start;
      console.log('Requête exécutée', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      const duration = Date.now() - start;
      console.error('Erreur de requête', { text, duration, error: err });
      throw err;
    }
  };
  
  return client;
};

// Fonction pour exécuter une transaction
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return { data: result, error: null };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur de transaction:', err);
    return { data: null, error: err };
  } finally {
    client.release();
  }
};

// Fonction pour fermer le pool
export const closePool = async () => {
  await pool.end();
  console.log('Pool PostgreSQL fermé');
};

// Exporter le pool pour un usage direct si nécessaire
export default {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  closePool
};