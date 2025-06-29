import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

console.log('🗄️ Configuration de la base de données SQLite...');

// Supprimer l'ancienne base de données si elle existe
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('✅ Ancienne base de données supprimée');
}

// Créer une nouvelle base de données
const db = new Database(DB_PATH);

console.log('📋 Création des tables...');

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

// Table des utilisateurs (remplace auth.users de Supabase)
db.exec(`
  CREATE TABLE users (
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
  )
`);

// Table des paramètres de l'entreprise
db.exec(`
  CREATE TABLE company_settings (
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
  )
`);

// Table des catégories de menu
db.exec(`
  CREATE TABLE menu_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des plats du menu
db.exec(`
  CREATE TABLE menu_items (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price REAL,
    image_url TEXT,
    ingredients TEXT, -- JSON array as string
    allergens TEXT,   -- JSON array as string
    preparation_time INTEGER,
    calories INTEGER,
    is_available BOOLEAN DEFAULT 1,
    is_festive BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL
  )
`);

// Table des menus spéciaux
db.exec(`
  CREATE TABLE special_menus (
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
  )
`);

// Table des albums de galerie
db.exec(`
  CREATE TABLE gallery_albums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    event_date DATE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des images de galerie
db.exec(`
  CREATE TABLE gallery_images (
    id TEXT PRIMARY KEY,
    album_id TEXT,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE CASCADE
  )
`);

// Table des commandes
db.exec(`
  CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
  )
`);

// Table des articles de commande
db.exec(`
  CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    menu_item_id TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    special_instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
  )
`);

// Table des réservations
db.exec(`
  CREATE TABLE reservations (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
  )
`);

// Table des sessions
db.exec(`
  CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Créer des index pour améliorer les performances
db.exec(`
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_role ON users(role);
  CREATE INDEX idx_menu_categories_is_active ON menu_categories(is_active);
  CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
  CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
  CREATE INDEX idx_special_menus_is_active ON special_menus(is_active);
  CREATE INDEX idx_gallery_albums_is_active ON gallery_albums(is_active);
  CREATE INDEX idx_gallery_images_album_id ON gallery_images(album_id);
  CREATE INDEX idx_orders_customer_id ON orders(customer_id);
  CREATE INDEX idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
  CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
  CREATE INDEX idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX idx_sessions_token ON sessions(token);
`);

console.log('✅ Toutes les tables ont été créées avec succès');

// Fermer la connexion
db.close();

console.log('🎉 Configuration de la base de données terminée!');