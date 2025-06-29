/*
  # Création des comptes de test

  Comptes créés:
  1. Admin: admin@dounieculisine.ca / Admin123!
  2. Employé: employe@dounieculisine.ca / Employe123!
  3. Client: client@dounieculisine.ca / Client123!

  Note: Ces comptes seront créés via l'interface d'authentification Supabase
  Les profils correspondants seront créés automatiquement via les triggers
*/

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'admin@dounieculisine.ca' THEN 'admin'
      WHEN new.email = 'employe@dounieculisine.ca' THEN 'employee'
      ELSE 'client'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON special_menus FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON gallery_albums FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();