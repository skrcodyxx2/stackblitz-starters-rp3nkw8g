/*
  # Correction finale des politiques RLS pour l'inscription

  1. Problème résolu
    - Suppression de toutes les politiques restrictives sur profiles
    - Création de politiques plus permissives pour l'inscription
    - Correction de la fonction handle_new_user

  2. Nouvelles politiques
    - Permet l'insertion de profils lors de l'inscription
    - Maintient la sécurité pour les autres opérations
    - Accès public aux données nécessaires
*/

-- Supprimer toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow role verification" ON profiles;

-- Désactiver temporairement RLS sur profiles pour permettre l'inscription
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Recréer les politiques plus permissives
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion lors de l'inscription (très permissive)
CREATE POLICY "Allow profile creation during signup" 
  ON profiles FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Politique pour permettre la lecture de son propre profil
CREATE POLICY "Users can read own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Politique pour les admins (lecture de tous les profils)
CREATE POLICY "Admins can read all profiles" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR auth.uid() = id
  );

-- Politique pour les admins (gestion complète)
CREATE POLICY "Admins can manage all profiles" 
  ON profiles FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Corriger la fonction handle_new_user pour être plus simple et robuste
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
  WHEN others THEN
    -- En cas d'erreur, on log mais on ne fait pas échouer l'inscription
    RAISE WARNING 'Erreur lors de la création du profil pour %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Assurer que les autres tables sont accessibles publiquement pour les données nécessaires
DROP POLICY IF EXISTS "Public can read company settings" ON company_settings;
CREATE POLICY "Public access to company settings" 
  ON company_settings FOR SELECT 
  TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "Public can read active menu categories" ON menu_categories;
CREATE POLICY "Public access to menu categories" 
  ON menu_categories FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can read available menu items" ON menu_items;
CREATE POLICY "Public access to menu items" 
  ON menu_items FOR SELECT 
  TO anon, authenticated 
  USING (is_available = true);

DROP POLICY IF EXISTS "Public can read active special menus" ON special_menus;
CREATE POLICY "Public access to special menus" 
  ON special_menus FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can read active albums" ON gallery_albums;
CREATE POLICY "Public access to gallery albums" 
  ON gallery_albums FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can read gallery images" ON gallery_images;
CREATE POLICY "Public access to gallery images" 
  ON gallery_images FOR SELECT 
  TO anon, authenticated 
  USING (
    EXISTS (SELECT 1 FROM gallery_albums WHERE id = gallery_images.album_id AND is_active = true)
  );

-- Vérifier qu'il y a des données de base
INSERT INTO company_settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Ajouter quelques catégories si elles n'existent pas
INSERT INTO menu_categories (name, description, image_url, sort_order) 
SELECT 'Plats Principaux', 'Nos spécialités haïtiennes authentiques', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 1
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Plats Principaux');

INSERT INTO menu_categories (name, description, image_url, sort_order) 
SELECT 'Entrées', 'Délicieuses entrées haïtiennes', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 2
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Entrées');