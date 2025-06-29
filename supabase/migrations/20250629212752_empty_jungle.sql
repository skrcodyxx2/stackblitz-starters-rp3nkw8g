/*
  # Simplification des politiques RLS

  1. Nouvelles Tables
    - Aucune nouvelle table créée

  2. Sécurité
    - Simplification des politiques RLS pour éviter les récursions
    - Maintien de la sécurité avec des politiques claires et directes
    - Amélioration de l'accès public aux données nécessaires
    - Optimisation des performances des requêtes

  3. Changements
    - Suppression des politiques complexes qui causent des timeouts
    - Création de nouvelles politiques plus simples et efficaces
    - Ajout de politiques publiques manquantes
*/

-- Supprimer toutes les politiques existantes sur profiles pour repartir proprement
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Allow role verification" ON profiles;

-- Créer des politiques simples et directes pour profiles
-- 1. Politique pour permettre à tous les utilisateurs de créer leur profil (nécessaire pour l'inscription)
CREATE POLICY "Anyone can create a profile" 
  ON profiles FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- 2. Politique pour permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Users can read own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- 3. Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- 4. Politique simple pour les admins - utilise les métadonnées JWT pour éviter la récursion
CREATE POLICY "Admins can manage all profiles" 
  ON profiles FOR ALL 
  TO authenticated 
  USING (
    -- Utiliser les métadonnées JWT pour vérifier le rôle admin
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    -- Vérifier directement si l'utilisateur est l'admin principal
    (auth.uid()::text = 'f6386c60-89e4-4c20-a731-7b80401ad7a7')
  );

-- Simplifier les politiques pour company_settings
DROP POLICY IF EXISTS "Everyone can read company settings" ON company_settings;
DROP POLICY IF EXISTS "Only admins can modify company settings" ON company_settings;
DROP POLICY IF EXISTS "Public access to company settings" ON company_settings;

-- Créer des politiques simples pour company_settings
CREATE POLICY "Public can read company settings" 
  ON company_settings FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Admins can modify company settings" 
  ON company_settings FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    (auth.uid()::text = 'f6386c60-89e4-4c20-a731-7b80401ad7a7')
  );

-- Simplifier les politiques pour menu_categories
DROP POLICY IF EXISTS "Everyone can read active menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Admins and employees can manage menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Public access to menu categories" ON menu_categories;

-- Créer des politiques simples pour menu_categories
CREATE POLICY "Public can read active menu categories" 
  ON menu_categories FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Staff can manage menu categories" 
  ON menu_categories FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Simplifier les politiques pour menu_items
DROP POLICY IF EXISTS "Everyone can read available menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins and employees can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Public access to menu items" ON menu_items;

-- Créer des politiques simples pour menu_items
CREATE POLICY "Public can read available menu items" 
  ON menu_items FOR SELECT 
  TO anon, authenticated 
  USING (is_available = true);

CREATE POLICY "Staff can manage menu items" 
  ON menu_items FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Simplifier les politiques pour special_menus
DROP POLICY IF EXISTS "Everyone can read active special menus" ON special_menus;
DROP POLICY IF EXISTS "Admins and employees can manage special menus" ON special_menus;
DROP POLICY IF EXISTS "Public access to special menus" ON special_menus;

-- Créer des politiques simples pour special_menus
CREATE POLICY "Public can read active special menus" 
  ON special_menus FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Staff can manage special menus" 
  ON special_menus FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Simplifier les politiques pour gallery_albums
DROP POLICY IF EXISTS "Everyone can read active albums" ON gallery_albums;
DROP POLICY IF EXISTS "Admins and employees can manage albums" ON gallery_albums;
DROP POLICY IF EXISTS "Public access to gallery albums" ON gallery_albums;

-- Créer des politiques simples pour gallery_albums
CREATE POLICY "Public can read active albums" 
  ON gallery_albums FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Staff can manage albums" 
  ON gallery_albums FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Simplifier les politiques pour gallery_images
DROP POLICY IF EXISTS "Everyone can read gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Admins and employees can manage gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Public access to gallery images" ON gallery_images;

-- Créer des politiques simples pour gallery_images
CREATE POLICY "Public can read gallery images" 
  ON gallery_images FOR SELECT 
  TO anon, authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM gallery_albums 
      WHERE id = gallery_images.album_id 
      AND is_active = true
    )
  );

CREATE POLICY "Staff can manage gallery images" 
  ON gallery_images FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Simplifier les politiques pour orders
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins and employees can manage all orders" ON orders;

-- Créer des politiques simples pour orders
CREATE POLICY "Users can read own orders" 
  ON orders FOR SELECT 
  TO authenticated 
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create orders" 
  ON orders FOR INSERT 
  TO authenticated 
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can manage all orders" 
  ON orders FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Simplifier les politiques pour order_items
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
DROP POLICY IF EXISTS "Admins and employees can manage all order items" ON order_items;

-- Créer des politiques simples pour order_items
CREATE POLICY "Users can read own order items" 
  ON order_items FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id 
      AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage all order items" 
  ON order_items FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Simplifier les politiques pour reservations
DROP POLICY IF EXISTS "Users can read own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON reservations;
DROP POLICY IF EXISTS "Admins and employees can manage all reservations" ON reservations;

-- Créer des politiques simples pour reservations
CREATE POLICY "Users can read own reservations" 
  ON reservations FOR SELECT 
  TO authenticated 
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create reservations" 
  ON reservations FOR INSERT 
  TO authenticated 
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can manage all reservations" 
  ON reservations FOR ALL 
  TO authenticated 
  USING (
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'employee')
    OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'employee')
    ))
  );

-- Mettre à jour la fonction handle_new_user pour être plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text := 'client';
BEGIN
  -- Déterminer le rôle basé sur l'email
  IF new.email = 'vfreud@yahoo.com' THEN
    user_role := 'admin';
  ELSIF new.email = 'employe@dounieculisine.ca' THEN
    user_role := 'employee';
  END IF;

  -- Insérer le profil avec un délai de 1 seconde pour éviter les problèmes de concurrence
  PERFORM pg_sleep(0.5);
  
  -- Insérer le profil
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    first_name, 
    last_name, 
    is_active,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    new.email,
    user_role,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    true,
    now(),
    now()
  );

  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- En cas de violation de contrainte unique, on ignore silencieusement
    RAISE NOTICE 'Profile already exists for %', new.email;
    RETURN new;
  WHEN others THEN
    -- En cas d'erreur, on log mais on ne fait pas échouer l'inscription
    RAISE WARNING 'Error creating profile for %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour l'admin existant pour s'assurer qu'il a le bon rôle
UPDATE profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'vfreud@yahoo.com';

-- Ajouter un index sur le champ role pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Ajouter un index sur le champ is_active pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_special_menus_is_active ON special_menus(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_is_active ON gallery_albums(is_active);

-- Ajouter un index sur les clés étrangères pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);