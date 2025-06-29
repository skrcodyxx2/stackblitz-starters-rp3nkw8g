/*
  # Migration complète - Dounie Cuisine Pro
  
  Cette migration recrée complètement le schéma de base de données avec:
  1. Toutes les tables nécessaires
  2. Politiques RLS appropriées
  3. Données de base
  4. Compte administrateur par défaut
  5. Triggers et fonctions
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer les tables existantes si elles existent (dans l'ordre des dépendances)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS loyalty_points CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS gallery_albums CASCADE;
DROP TABLE IF EXISTS special_menus CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS create_audit_log() CASCADE;

-- Table des profils utilisateur
CREATE TABLE profiles (
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
CREATE TABLE company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Dounie Cuisine Pro',
  slogan text DEFAULT 'Saveurs Authentiques Caribéennes',
  description text DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.',
  address text DEFAULT 'Montréal, Québec, Canada',
  phone text DEFAULT '+1 (514) 123-4567',
  email text DEFAULT 'info@dounieculisine.ca',
  website text DEFAULT 'https://dounieculisine.ca',
  logo_url text,
  favicon_url text,
  hero_title text DEFAULT 'Saveurs Authentiques Caribéennes',
  hero_subtitle text DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
  hero_image_url text DEFAULT 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  tax_tps numeric(5,4) DEFAULT 0.05,
  tax_tvq numeric(5,4) DEFAULT 0.09975,
  business_hours jsonb DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": true}
  }'::jsonb,
  social_media jsonb DEFAULT '{
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "linkedin": ""
  }'::jsonb,
  privacy_policy text DEFAULT 'Notre politique de confidentialité sera mise à jour prochainement.',
  terms_of_service text DEFAULT 'Nos conditions d''utilisation seront mises à jour prochainement.',
  about_us text DEFAULT 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des catégories de menu
CREATE TABLE menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des plats du menu
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2),
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

-- Table des menus spéciaux
CREATE TABLE special_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text NOT NULL,
  event_type text NOT NULL,
  price numeric(10,2),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des albums de galerie
CREATE TABLE gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_url text,
  event_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des images de galerie
CREATE TABLE gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table des commandes
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Table des réservations
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE TABLE quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table d'inventaire
CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE TABLE financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE TABLE loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Table des journaux d'audit
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Politiques pour company_settings
CREATE POLICY "Everyone can read company settings" ON company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify company settings" ON company_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Politiques pour menu_categories
CREATE POLICY "Everyone can read active menu categories" ON menu_categories FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins and employees can manage menu categories" ON menu_categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour menu_items
CREATE POLICY "Everyone can read available menu items" ON menu_items FOR SELECT TO authenticated USING (is_available = true);
CREATE POLICY "Admins and employees can manage menu items" ON menu_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour special_menus
CREATE POLICY "Everyone can read active special menus" ON special_menus FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins and employees can manage special menus" ON special_menus FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour gallery_albums
CREATE POLICY "Everyone can read active albums" ON gallery_albums FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins and employees can manage albums" ON gallery_albums FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour gallery_images
CREATE POLICY "Everyone can read gallery images" ON gallery_images FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM gallery_albums WHERE id = gallery_images.album_id AND is_active = true)
);
CREATE POLICY "Admins and employees can manage gallery images" ON gallery_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour orders
CREATE POLICY "Users can read own orders" ON orders FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Admins and employees can manage all orders" ON orders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour order_items
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND customer_id = auth.uid())
);
CREATE POLICY "Admins and employees can manage all order items" ON order_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour reservations
CREATE POLICY "Users can read own reservations" ON reservations FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Admins and employees can manage all reservations" ON reservations FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour quotes
CREATE POLICY "Admins and employees can manage all quotes" ON quotes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);
CREATE POLICY "Users can read own quotes" ON quotes FOR SELECT TO authenticated USING (customer_id = auth.uid());

-- Politiques pour quote_items
CREATE POLICY "Admins and employees can manage all quote items" ON quote_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);
CREATE POLICY "Users can read own quote items" ON quote_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM quotes WHERE id = quote_items.quote_id AND customer_id = auth.uid())
);

-- Politiques pour inventory_items
CREATE POLICY "Admins and employees can manage inventory" ON inventory_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Politiques pour financial_transactions
CREATE POLICY "Only admins can manage financial transactions" ON financial_transactions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Politiques pour loyalty_points
CREATE POLICY "Admins and employees can manage all loyalty points" ON loyalty_points FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);
CREATE POLICY "Users can read own loyalty points" ON loyalty_points FOR SELECT TO authenticated USING (customer_id = auth.uid());

-- Politiques pour audit_logs
CREATE POLICY "Only admins can read audit logs" ON audit_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'vfreud@yahoo.com' THEN 'admin'
      WHEN new.email = 'employe@dounieculisine.ca' THEN 'employee'
      ELSE 'client'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers pour updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON special_menus FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON gallery_albums FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Insérer les paramètres par défaut de l'entreprise
INSERT INTO company_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Insérer des catégories de menu par défaut
INSERT INTO menu_categories (name, description, image_url, sort_order) VALUES
('Entrées', 'Délicieuses entrées haïtiennes pour commencer votre repas', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 1),
('Plats Principaux', 'Nos spécialités haïtiennes authentiques', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 2),
('Accompagnements', 'Riz, légumes et autres accompagnements traditionnels', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 3),
('Desserts', 'Douceurs caribéennes pour terminer en beauté', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 4),
('Boissons', 'Boissons traditionnelles et rafraîchissantes', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 5)
ON CONFLICT DO NOTHING;

-- Insérer des plats d'exemple
INSERT INTO menu_items (category_id, name, description, price, image_url, ingredients, allergens, preparation_time, calories, is_available, sort_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Griot Haïtien', 'Porc mariné et frit, servi avec du riz et des légumes traditionnels', 25.99, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Porc', 'Épices haïtiennes', 'Ail', 'Citron vert'], ARRAY[], 45, 650, true, 1),
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Poulet Créole', 'Poulet mijoté aux épices créoles avec légumes et riz parfumé', 22.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Poulet', 'Tomates', 'Oignons', 'Épices créoles'], ARRAY[], 40, 580, true, 2),
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Poisson Gros Sel', 'Poisson frais grillé au gros sel avec légumes de saison', 28.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Poisson frais', 'Gros sel', 'Légumes', 'Herbes'], ARRAY['Poisson'], 35, 520, true, 3),
((SELECT id FROM menu_categories WHERE name = 'Entrées' LIMIT 1), 'Accra de Morue', 'Beignets de morue épicés, spécialité antillaise', 12.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Morue', 'Farine', 'Épices', 'Huile'], ARRAY['Gluten', 'Poisson'], 25, 320, true, 1),
((SELECT id FROM menu_categories WHERE name = 'Accompagnements' LIMIT 1), 'Riz Collé aux Haricots', 'Riz traditionnel haïtien aux haricots rouges', 8.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Riz', 'Haricots rouges', 'Lait de coco'], ARRAY[], 30, 280, true, 1),
((SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1), 'Flan Coco', 'Flan traditionnel au lait de coco', 6.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Lait de coco', 'Œufs', 'Sucre', 'Vanille'], ARRAY['Œufs', 'Lactose'], 20, 250, true, 1),
((SELECT id FROM menu_categories WHERE name = 'Boissons' LIMIT 1), 'Jus de Fruit de la Passion', 'Jus frais de fruit de la passion', 4.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Fruit de la passion', 'Sucre', 'Eau'], ARRAY[], 5, 120, true, 1)
ON CONFLICT DO NOTHING;

-- Insérer des menus spéciaux
INSERT INTO special_menus (name, description, image_url, event_type, price, sort_order) VALUES
('Menu Mariage Traditionnel', 'Menu complet pour célébrations de mariage avec plats traditionnels haïtiens', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Mariage', 45.00, 1),
('Menu Anniversaire Festif', 'Sélection spéciale pour anniversaires avec desserts et plats de fête', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Anniversaire', 35.00, 2),
('Menu Corporatif', 'Menu professionnel adapté aux événements d''entreprise', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Corporatif', 40.00, 3)
ON CONFLICT DO NOTHING;

-- Insérer des albums de galerie d'exemple
INSERT INTO gallery_albums (name, description, cover_image_url, event_date) VALUES
('Mariage de Marie et Jean', 'Magnifique célébration de mariage avec 120 invités', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-06-15'),
('Anniversaire 50 ans de Paul', 'Fête d''anniversaire familiale avec cuisine traditionnelle', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-05-20'),
('Événement Corporatif ABC Inc', 'Réception d''entreprise avec service traiteur complet', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-04-10')
ON CONFLICT DO NOTHING;

-- Insérer des images pour les albums
INSERT INTO gallery_images (album_id, image_url, caption, sort_order) VALUES
((SELECT id FROM gallery_albums WHERE name = 'Mariage de Marie et Jean' LIMIT 1), 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Table d''honneur magnifiquement dressée', 1),
((SELECT id FROM gallery_albums WHERE name = 'Mariage de Marie et Jean' LIMIT 1), 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet de plats haïtiens traditionnels', 2),
((SELECT id FROM gallery_albums WHERE name = 'Anniversaire 50 ans de Paul' LIMIT 1), 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Gâteau d''anniversaire et desserts', 1),
((SELECT id FROM gallery_albums WHERE name = 'Événement Corporatif ABC Inc' LIMIT 1), 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Service cocktail professionnel', 1)
ON CONFLICT DO NOTHING;