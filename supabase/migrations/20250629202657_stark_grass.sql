/*
  # Create admin user and fix policies

  1. New Features
    - Create admin user with email vfreud@yahoo.com
    - Fix public access policies for anonymous users
    - Add missing policies for public access

  2. Security
    - Ensure admin user has proper role
    - Fix search_path in functions for security
    - Add public access policies for unauthenticated users
*/

-- Add public access policies for anonymous users
DO $$
BEGIN
  -- Check if policy exists before creating
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

-- Fix handle_new_user function with search_path
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

-- Fix handle_updated_at function with search_path
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

-- Create policy for profile creation during signup
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

-- Ensure admin user exists in profiles
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'vfreud@yahoo.com' LIMIT 1;
  
  -- If admin user exists in auth but not in profiles, create profile
  IF admin_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'vfreud@yahoo.com'
  ) THEN
    INSERT INTO profiles (
      id, 
      email, 
      role, 
      first_name, 
      last_name, 
      is_active,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'vfreud@yahoo.com',
      'admin',
      'Admin',
      'User',
      true,
      now(),
      now()
    );
  END IF;
END $$;