/*
  # Add missing columns to company_settings table

  1. Missing Columns
    - `description` (text) - Company description
    - `hero_title` (text) - Hero section title
    - `hero_subtitle` (text) - Hero section subtitle  
    - `hero_image_url` (text) - Hero section background image
    - `about_us` (text) - About us content
    - `slogan` (text) - Company slogan
    - `address` (text) - Company address
    - `website` (text) - Company website
    - `logo_url` (text) - Company logo URL
    - `favicon_url` (text) - Company favicon URL
    - `tax_tps` (numeric) - TPS tax rate
    - `tax_tvq` (numeric) - TVQ tax rate
    - `business_hours` (jsonb) - Business hours configuration
    - `social_media` (jsonb) - Social media links
    - `privacy_policy` (text) - Privacy policy content
    - `terms_of_service` (text) - Terms of service content

  2. Data Population
    - Add default values for all new columns
    - Ensure backward compatibility
*/

-- Add missing columns to company_settings table
DO $$
BEGIN
  -- Add description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'description'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN description text DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.';
  END IF;

  -- Add slogan column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'slogan'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN slogan text DEFAULT 'Saveurs Authentiques Caribéennes';
  END IF;

  -- Add address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'address'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN address text DEFAULT 'Montréal, Québec, Canada';
  END IF;

  -- Add website column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'website'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN website text DEFAULT 'https://dounieculisine.ca';
  END IF;

  -- Add logo_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN logo_url text;
  END IF;

  -- Add favicon_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'favicon_url'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN favicon_url text;
  END IF;

  -- Add hero_title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'hero_title'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN hero_title text DEFAULT 'Saveurs Authentiques Caribéennes';
  END IF;

  -- Add hero_subtitle column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'hero_subtitle'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN hero_subtitle text DEFAULT 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.';
  END IF;

  -- Add hero_image_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'hero_image_url'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN hero_image_url text DEFAULT 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop';
  END IF;

  -- Add tax_tps column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'tax_tps'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN tax_tps numeric(5,4) DEFAULT 0.05;
  END IF;

  -- Add tax_tvq column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'tax_tvq'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN tax_tvq numeric(5,4) DEFAULT 0.09975;
  END IF;

  -- Add business_hours column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'business_hours'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN business_hours jsonb DEFAULT '{
      "monday": {"open": "09:00", "close": "18:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
      "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
      "thursday": {"open": "09:00", "close": "18:00", "closed": false},
      "friday": {"open": "09:00", "close": "18:00", "closed": false},
      "saturday": {"open": "10:00", "close": "16:00", "closed": false},
      "sunday": {"open": "10:00", "close": "16:00", "closed": true}
    }'::jsonb;
  END IF;

  -- Add social_media column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'social_media'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN social_media jsonb DEFAULT '{
      "facebook": "",
      "instagram": "",
      "twitter": "",
      "linkedin": ""
    }'::jsonb;
  END IF;

  -- Add privacy_policy column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'privacy_policy'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN privacy_policy text DEFAULT 'Notre politique de confidentialité sera mise à jour prochainement.';
  END IF;

  -- Add terms_of_service column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'terms_of_service'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN terms_of_service text DEFAULT 'Nos conditions d''utilisation seront mises à jour prochainement.';
  END IF;

  -- Add about_us column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'about_us'
  ) THEN
    ALTER TABLE company_settings ADD COLUMN about_us text DEFAULT 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.';
  END IF;
END $$;

-- Update existing records with default values if they exist
UPDATE company_settings SET
  description = COALESCE(description, 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.'),
  slogan = COALESCE(slogan, 'Saveurs Authentiques Caribéennes'),
  address = COALESCE(address, 'Montréal, Québec, Canada'),
  website = COALESCE(website, 'https://dounieculisine.ca'),
  hero_title = COALESCE(hero_title, 'Saveurs Authentiques Caribéennes'),
  hero_subtitle = COALESCE(hero_subtitle, 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.'),
  hero_image_url = COALESCE(hero_image_url, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'),
  tax_tps = COALESCE(tax_tps, 0.05),
  tax_tvq = COALESCE(tax_tvq, 0.09975),
  business_hours = COALESCE(business_hours, '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": true}
  }'::jsonb),
  social_media = COALESCE(social_media, '{
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "linkedin": ""
  }'::jsonb),
  privacy_policy = COALESCE(privacy_policy, 'Notre politique de confidentialité sera mise à jour prochainement.'),
  terms_of_service = COALESCE(terms_of_service, 'Nos conditions d''utilisation seront mises à jour prochainement.'),
  about_us = COALESCE(about_us, 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.')
WHERE id IS NOT NULL;