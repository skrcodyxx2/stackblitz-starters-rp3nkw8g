/*
  # Fix function search path security issues
  
  1. Security Improvements
    - Add search_path parameter to functions to prevent search_path manipulation
    - Fix the handle_new_user and handle_updated_at functions
    
  2. Changes
    - Add SET search_path = public to both functions
    - Improve error handling in handle_new_user
*/

-- Fix handle_new_user function
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

-- Fix handle_updated_at function
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

-- Add public access policies for anonymous users
CREATE POLICY "Public access to company settings" 
  ON company_settings FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Public access to menu categories" 
  ON menu_categories FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Public access to menu items" 
  ON menu_items FOR SELECT 
  TO anon, authenticated 
  USING (is_available = true);

CREATE POLICY "Public access to special menus" 
  ON special_menus FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Public access to gallery albums" 
  ON gallery_albums FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Public access to gallery images" 
  ON gallery_images FOR SELECT 
  TO anon, authenticated 
  USING (
    EXISTS (SELECT 1 FROM gallery_albums WHERE id = gallery_images.album_id AND is_active = true)
  );