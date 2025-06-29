/*
  # Schéma initial pour Dounie Cuisine Pro

  1. Nouvelles Tables
    - `profiles` - Profils utilisateurs avec rôles
    - `company_settings` - Paramètres de l'entreprise
    - `menu_categories` - Catégories du menu
    - `menu_items` - Articles du menu
    - `orders` - Commandes
    - `order_items` - Articles des commandes
    - `reservations` - Réservations d'événements
    - `quotes` - Devis
    - `quote_items` - Articles des devis
    - `inventory_items` - Articles d'inventaire
    - `financial_transactions` - Transactions financières
    - `loyalty_points` - Points de fidélité
    - `announcements` - Annonces
    - `media_files` - Fichiers média
    - `audit_logs` - Journaux d'audit

  2. Sécurité
    - Activation RLS sur toutes les tables
    - Politiques d'accès basées sur les rôles
    - Sécurisation des données sensibles

  3. Fonctionnalités
    - Gestion complète des utilisateurs et rôles
    - Système de commandes et réservations
    - Gestion d'inventaire
    - Programme de fidélité
    - Audit et traçabilité
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'employee', 'client')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  must_change_password boolean DEFAULT false
);

-- Table des paramètres de l'entreprise
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL DEFAULT 'Dounie Cuisine Pro',
  slogan text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  favicon_url text,
  tax_tps numeric(5,4) DEFAULT 0.05,
  tax_tvq numeric(5,4) DEFAULT 0.09975,
  business_hours jsonb DEFAULT '{}',
  social_media jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des catégories de menu
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des articles du menu
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  ingredients text[],
  allergens text[],
  preparation_time integer,
  calories integer,
  is_available boolean DEFAULT true,
  is_festive boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  delivery_type text NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_address text,
  delivery_date timestamptz,
  delivery_time text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reservation_number text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_date timestamptz NOT NULL,
  event_time text,
  guest_count integer NOT NULL,
  venue_address text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  estimated_cost numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des devis
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  quote_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until timestamptz,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des articles de devis
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table d'inventaire
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text,
  current_stock numeric(10,2) NOT NULL DEFAULT 0,
  minimum_stock numeric(10,2) DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs',
  unit_cost numeric(10,2) DEFAULT 0,
  supplier text,
  last_order_date timestamptz,
  expiration_date timestamptz,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des transactions financières
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text,
  reference_id uuid,
  reference_type text,
  transaction_date timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des points de fidélité
CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  points_earned integer DEFAULT 0,
  points_used integer DEFAULT 0,
  points_balance integer DEFAULT 0,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired')),
  reference_id uuid,
  reference_type text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table des annonces
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active boolean DEFAULT true,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  target_audience text DEFAULT 'all' CHECK (target_audience IN ('all', 'clients', 'employees', 'admins')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des fichiers média
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  alt_text text,
  category text DEFAULT 'general',
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des journaux d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Activation RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour company_settings
CREATE POLICY "Everyone can read company settings"
  ON company_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify company settings"
  ON company_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour menu_categories
CREATE POLICY "Everyone can read active menu categories"
  ON menu_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins and employees can manage menu categories"
  ON menu_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Politiques RLS pour menu_items
CREATE POLICY "Everyone can read available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admins and employees can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Politiques RLS pour orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins and employees can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Politiques RLS pour order_items
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins and employees can manage all order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Politiques RLS pour reservations
CREATE POLICY "Users can read own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins and employees can manage all reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Insertion des données initiales
INSERT INTO company_settings (name, slogan, phone, email) VALUES 
('Dounie Cuisine Pro', 'Service Traiteur Premium', '+1 (514) 123-4567', 'info@dounieculisine.ca')
ON CONFLICT DO NOTHING;

-- Catégories de menu par défaut
INSERT INTO menu_categories (name, description, sort_order) VALUES 
('Plats Principaux', 'Nos spécialités haïtiennes et caribéennes', 1),
('Entrées', 'Commencez votre repas en beauté', 2),
('Desserts', 'Douceurs traditionnelles', 3),
('Boissons', 'Rafraîchissements et boissons chaudes', 4)
ON CONFLICT DO NOTHING;