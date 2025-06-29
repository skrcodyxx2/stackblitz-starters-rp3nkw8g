/*
  # Create company_settings table with proper error handling

  1. New Tables
    - `company_settings` - Company configuration and settings
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `slogan` (text, company slogan)
      - `description` (text, company description)
      - `address` (text, company address)
      - `phone` (text, contact phone)
      - `email` (text, contact email)
      - `website` (text, company website)
      - `logo_url` (text, logo image URL)
      - `favicon_url` (text, favicon URL)
      - `hero_title` (text, homepage hero title)
      - `hero_subtitle` (text, homepage hero subtitle)
      - `hero_image_url` (text, hero background image)
      - `tax_tps` (numeric, TPS tax rate)
      - `tax_tvq` (numeric, TVQ tax rate)
      - `business_hours` (jsonb, operating hours)
      - `social_media` (jsonb, social media links)
      - `privacy_policy` (text, privacy policy content)
      - `terms_of_service` (text, terms of service content)
      - `about_us` (text, about us content)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on company_settings table
    - Add policy for public read access
    - Add policy for admin-only write access

  3. Data
    - Insert default company settings record
*/

-- Create company_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_settings (
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
    "facebook": "https://facebook.com/dounieculisine",
    "instagram": "https://instagram.com/dounieculisine",
    "twitter": "https://twitter.com/dounieculisine",
    "linkedin": ""
  }'::jsonb,
  privacy_policy text DEFAULT 'Notre politique de confidentialité sera mise à jour prochainement.',
  terms_of_service text DEFAULT 'Nos conditions d''utilisation seront mises à jour prochainement.',
  about_us text DEFAULT 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'company_settings'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create read policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_settings' 
    AND policyname = 'Everyone can read company settings'
  ) THEN
    CREATE POLICY "Everyone can read company settings"
      ON company_settings
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create admin policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_settings' 
    AND policyname = 'Only admins can modify company settings'
  ) THEN
    CREATE POLICY "Only admins can modify company settings"
      ON company_settings
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'handle_updated_at' 
    AND tgrelid = 'company_settings'::regclass
  ) THEN
    CREATE TRIGGER handle_updated_at
      BEFORE UPDATE ON company_settings
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Insert default company settings if none exist
INSERT INTO company_settings (
  name,
  slogan,
  description,
  address,
  phone,
  email,
  website,
  hero_title,
  hero_subtitle,
  hero_image_url,
  tax_tps,
  tax_tvq,
  business_hours,
  social_media,
  privacy_policy,
  terms_of_service,
  about_us
) 
SELECT 
  'Dounie Cuisine Pro',
  'Saveurs Authentiques Caribéennes',
  'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.',
  'Montréal, Québec, Canada',
  '+1 (514) 123-4567',
  'info@dounieculisine.ca',
  'https://dounieculisine.ca',
  'Saveurs Authentiques Caribéennes',
  'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  0.05,
  0.09975,
  '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": true}
  }'::jsonb,
  '{
    "facebook": "https://facebook.com/dounieculisine",
    "instagram": "https://instagram.com/dounieculisine",
    "twitter": "https://twitter.com/dounieculisine",
    "linkedin": ""
  }'::jsonb,
  'Notre politique de confidentialité sera mise à jour prochainement.',
  'Nos conditions d''utilisation seront mises à jour prochainement.',
  'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);