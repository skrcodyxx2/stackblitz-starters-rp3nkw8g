import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

console.log('🗄️ Configuration de la base de données SQLite...');

// Créer ou ouvrir la base de données
const db = new Database(DB_PATH);

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

console.log('✅ Base de données SQLite créée/ouverte');

// Créer les tables
const createTables = `
-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'employee', 'client')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  must_change_password BOOLEAN DEFAULT 0
);

-- Table des paramètres de l'entreprise
CREATE TABLE IF NOT EXISTS company_settings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Dounie Cuisine Pro',
  slogan TEXT DEFAULT 'Saveurs Authentiques Caribéennes',
  description TEXT DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.',
  address TEXT DEFAULT 'Montréal, Québec, Canada',
  phone TEXT DEFAULT '+1 (514) 123-4567',
  email TEXT DEFAULT 'info@dounieculisine.ca',
  website TEXT DEFAULT 'https://dounieculisine.ca',
  logo_url TEXT,
  favicon_url TEXT,
  hero_title TEXT DEFAULT 'Saveurs Authentiques Caribéennes',
  hero_subtitle TEXT DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
  hero_image_url TEXT DEFAULT 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  tax_tps REAL DEFAULT 0.05,
  tax_tvq REAL DEFAULT 0.09975,
  business_hours TEXT DEFAULT '{"monday": {"open": "09:00", "close": "18:00", "closed": false}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "friday": {"open": "09:00", "close": "18:00", "closed": false}, "saturday": {"open": "10:00", "close": "16:00", "closed": false}, "sunday": {"open": "10:00", "close": "16:00", "closed": true}}',
  social_media TEXT DEFAULT '{"facebook": "https://facebook.com/dounieculisine", "instagram": "https://instagram.com/dounieculisine", "twitter": "https://twitter.com/dounieculisine", "linkedin": ""}',
  privacy_policy TEXT DEFAULT 'Notre politique de confidentialité sera mise à jour prochainement.',
  terms_of_service TEXT DEFAULT 'Nos conditions d''utilisation seront mises à jour prochainement.',
  about_us TEXT DEFAULT 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories de menu
CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des plats du menu
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price REAL,
  image_url TEXT,
  ingredients TEXT, -- JSON array
  allergens TEXT, -- JSON array
  preparation_time INTEGER,
  calories INTEGER,
  is_available BOOLEAN DEFAULT 1,
  is_festive BOOLEAN DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des menus spéciaux
CREATE TABLE IF NOT EXISTS special_menus (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT NOT NULL,
  event_type TEXT NOT NULL,
  price REAL,
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des albums de galerie
CREATE TABLE IF NOT EXISTS gallery_albums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  event_date DATE,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des images de galerie
CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  album_id TEXT REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  delivery_type TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  delivery_date DATETIME,
  delivery_time TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  special_instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reservation_number TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATETIME NOT NULL,
  event_time TEXT,
  guest_count INTEGER NOT NULL,
  venue_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  estimated_cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_special_menus_is_active ON special_menus(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_is_active ON gallery_albums(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
`;

// Exécuter la création des tables
try {
  db.exec(createTables);
  console.log('✅ Tables créées avec succès');
} catch (error) {
  console.error('❌ Erreur lors de la création des tables:', error);
  process.exit(1);
}

// Fermer la connexion
db.close();

console.log('🎉 Configuration de la base de données terminée!');
console.log(`📍 Base de données créée à: ${DB_PATH}`);