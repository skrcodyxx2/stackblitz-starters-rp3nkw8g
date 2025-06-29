/*
  # Correction des politiques RLS pour l'inscription

  1. Problème résolu
    - Les politiques RLS empêchaient la création de nouveaux profils
    - Ajout d'une politique pour permettre l'insertion de profils lors de l'inscription

  2. Sécurité
    - Maintien de la sécurité avec des politiques appropriées
    - Permettre uniquement l'insertion pour les nouveaux utilisateurs authentifiés
*/

-- Supprimer les anciennes politiques pour profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Nouvelles politiques pour profiles avec support de l'inscription
CREATE POLICY "Users can read own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
  ON profiles FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politique spéciale pour permettre la lecture des profils admin (nécessaire pour vérifier les rôles)
CREATE POLICY "Allow role verification" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (role = 'admin');

-- Corriger la fonction handle_new_user pour être plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name, is_active)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'vfreud@yahoo.com' THEN 'admin'
      WHEN new.email = 'employe@dounieculisine.ca' THEN 'employee'
      ELSE 'client'
    END,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    true
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

-- Politique temporaire pour permettre l'accès public aux paramètres de l'entreprise
DROP POLICY IF EXISTS "Everyone can read company settings" ON company_settings;
CREATE POLICY "Public can read company settings" 
  ON company_settings FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Politique temporaire pour permettre l'accès public au menu
DROP POLICY IF EXISTS "Everyone can read active menu categories" ON menu_categories;
CREATE POLICY "Public can read active menu categories" 
  ON menu_categories FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS "Everyone can read available menu items" ON menu_items;
CREATE POLICY "Public can read available menu items" 
  ON menu_items FOR SELECT 
  TO anon, authenticated 
  USING (is_available = true);

DROP POLICY IF EXISTS "Everyone can read active special menus" ON special_menus;
CREATE POLICY "Public can read active special menus" 
  ON special_menus FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

-- Politique pour la galerie publique
DROP POLICY IF EXISTS "Everyone can read active albums" ON gallery_albums;
CREATE POLICY "Public can read active albums" 
  ON gallery_albums FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

DROP POLICY IF EXISTS "Everyone can read gallery images" ON gallery_images;
CREATE POLICY "Public can read gallery images" 
  ON gallery_images FOR SELECT 
  TO anon, authenticated 
  USING (
    EXISTS (SELECT 1 FROM gallery_albums WHERE id = gallery_images.album_id AND is_active = true)
  );

-- Assurer qu'il y a au moins un enregistrement dans company_settings
INSERT INTO company_settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM company_settings);