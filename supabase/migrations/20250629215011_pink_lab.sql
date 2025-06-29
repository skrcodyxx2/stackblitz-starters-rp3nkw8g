/*
  # Fix profile timeout issues and improve database performance
  
  1. Performance Improvements
    - Add indexes to frequently queried columns
    - Optimize RLS policies to reduce query complexity
    
  2. Security Enhancements
    - Fix admin policies to avoid recursion
    - Ensure public access to necessary tables
    
  3. Reliability Improvements
    - Optimize handle_new_user function
    - Add error handling for profile creation
*/

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_menu_categories_is_active ON menu_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_special_menus_is_active ON special_menus(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_is_active ON gallery_albums(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);

-- Simplify profiles policies to avoid recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create a new admin policy that doesn't cause recursion
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  TO authenticated
  USING (
    -- Check if the user has admin role in their JWT claims
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    -- Fallback: allow if user is the specific admin user
    (auth.uid()::text = 'f6386c60-89e4-4c20-a731-7b80401ad7a7'::text)
  );

-- Ensure all public tables have proper access policies
DO $$
BEGIN
  -- Company settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_settings' 
    AND policyname = 'Public can read company settings'
  ) THEN
    CREATE POLICY "Public can read company settings" 
      ON company_settings FOR SELECT 
      TO anon, authenticated 
      USING (true);
  END IF;
  
  -- Menu categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_categories' 
    AND policyname = 'Public can read active menu categories'
  ) THEN
    CREATE POLICY "Public can read active menu categories" 
      ON menu_categories FOR SELECT 
      TO anon, authenticated 
      USING (is_active = true);
  END IF;
  
  -- Menu items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Public can read available menu items'
  ) THEN
    CREATE POLICY "Public can read available menu items" 
      ON menu_items FOR SELECT 
      TO anon, authenticated 
      USING (is_available = true);
  END IF;
  
  -- Special menus
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'special_menus' 
    AND policyname = 'Public can read active special menus'
  ) THEN
    CREATE POLICY "Public can read active special menus" 
      ON special_menus FOR SELECT 
      TO anon, authenticated 
      USING (is_active = true);
  END IF;
  
  -- Gallery albums
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gallery_albums' 
    AND policyname = 'Public can read active albums'
  ) THEN
    CREATE POLICY "Public can read active albums" 
      ON gallery_albums FOR SELECT 
      TO anon, authenticated 
      USING (is_active = true);
  END IF;
  
  -- Gallery images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'gallery_images' 
    AND policyname = 'Public can read gallery images'
  ) THEN
    CREATE POLICY "Public can read gallery images" 
      ON gallery_images FOR SELECT 
      TO anon, authenticated 
      USING (
        EXISTS (SELECT 1 FROM gallery_albums WHERE id = gallery_images.album_id AND is_active = true)
      );
  END IF;
END $$;

-- Update the admin user's role to ensure they have proper access
UPDATE profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'vfreud@yahoo.com' AND role != 'admin';

-- Optimize the handle_new_user function to be more reliable
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text := 'client';
BEGIN
  -- Determine role based on email
  IF new.email = 'vfreud@yahoo.com' THEN
    user_role := 'admin';
  ELSIF new.email = 'employe@dounieculisine.ca' THEN
    user_role := 'employee';
  END IF;

  -- Insert profile with a small delay to avoid race conditions
  PERFORM pg_sleep(0.1);
  
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
  WHEN unique_violation THEN
    -- If profile already exists, just continue
    RAISE NOTICE 'Profile already exists for %', new.email;
    RETURN new;
  WHEN others THEN
    -- Log any other errors but don't fail the signup
    RAISE WARNING 'Error creating profile for %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;