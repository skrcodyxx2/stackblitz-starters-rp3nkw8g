/*
  # Fix security warnings and improve database functions
  
  1. Security Improvements
    - Fix function search_path for handle_new_user and handle_updated_at
    - Add proper security settings to functions
    - Ensure proper error handling
  
  2. Function Improvements
    - Better error handling in handle_new_user
    - More robust profile creation
*/

-- Fix handle_new_user function with proper search_path and security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text := 'client';
BEGIN
  -- Determine role based on email
  IF new.email = 'vfreud@yahoo.com' THEN
    user_role := 'admin';
  ELSIF new.email = 'employe@dounieculisine.ca' THEN
    user_role := 'employee';
  END IF;

  -- Insert profile
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
    -- Log error but don't fail signup
    RAISE WARNING 'Error creating profile for %: %', new.email, SQLERRM;
    RETURN new;
END;
$$;

-- Fix handle_updated_at function with proper search_path and security settings
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add policy for profile creation during signup if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Allow profile creation during signup'
  ) THEN
    CREATE POLICY "Allow profile creation during signup" 
      ON profiles FOR INSERT 
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Add public access policies for anonymous users if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_settings' 
    AND policyname = 'Public access to company settings'
  ) THEN
    CREATE POLICY "Public access to company settings" 
      ON company_settings FOR SELECT 
      TO anon, authenticated 
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_categories' 
    AND policyname = 'Public access to menu categories'
  ) THEN
    CREATE POLICY "Public access to menu categories" 
      ON menu_categories FOR SELECT 
      TO anon, authenticated 
      USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Public access to menu items'
  ) THEN
    CREATE POLICY "Public access to menu items" 
      ON menu_items FOR SELECT 
      TO anon, authenticated 
      USING (is_available = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'special_menus' 
    AND policyname = 'Public access to special menus'
  ) THEN
    CREATE POLICY "Public access to special menus" 
      ON special_menus FOR SELECT 
      TO anon, authenticated 
      USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gallery_albums' 
    AND policyname = 'Public access to gallery albums'
  ) THEN
    CREATE POLICY "Public access to gallery albums" 
      ON gallery_albums FOR SELECT 
      TO anon, authenticated 
      USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gallery_images' 
    AND policyname = 'Public access to gallery images'
  ) THEN
    CREATE POLICY "Public access to gallery images" 
      ON gallery_images FOR SELECT 
      TO anon, authenticated 
      USING (
        EXISTS (SELECT 1 FROM gallery_albums WHERE id = gallery_images.album_id AND is_active = true)
      );
  END IF;
END $$;