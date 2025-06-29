/*
  # Add missing columns to company_settings table

  1. New Columns Added
    - `description` (text) - Company description with default value
    - `hero_title` (text) - Hero section title with default value
    - `hero_subtitle` (text) - Hero section subtitle with default value
    - `hero_image_url` (text) - Hero section background image URL with default value
    - `about_us` (text) - About us section content with default value
    - `privacy_policy` (text) - Privacy policy content with default value
    - `terms_of_service` (text) - Terms of service content with default value

  2. Changes
    - All new columns are nullable to allow for gradual content updates
    - Default values provided to ensure immediate functionality
    - Maintains existing data integrity

  3. Notes
    - These columns are required by the frontend components (Footer.tsx and HomePage.tsx)
    - Default values match the existing application expectations
*/

-- Add missing columns to company_settings table
DO $$
BEGIN
  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'description'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN description text DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.';
  END IF;

  -- Add hero_title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'hero_title'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN hero_title text DEFAULT 'Saveurs Authentiques Caribéennes';
  END IF;

  -- Add hero_subtitle column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'hero_subtitle'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN hero_subtitle text DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.';
  END IF;

  -- Add hero_image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'hero_image_url'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN hero_image_url text DEFAULT 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';
  END IF;

  -- Add about_us column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'about_us'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN about_us text DEFAULT 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.';
  END IF;

  -- Add privacy_policy column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'privacy_policy'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN privacy_policy text DEFAULT 'Notre politique de confidentialité sera mise à jour prochainement.';
  END IF;

  -- Add terms_of_service column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'terms_of_service'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN terms_of_service text DEFAULT 'Nos conditions d''utilisation seront mises à jour prochainement.';
  END IF;
END $$;