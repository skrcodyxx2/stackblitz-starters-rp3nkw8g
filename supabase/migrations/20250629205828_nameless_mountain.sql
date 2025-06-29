/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "profiles"
    - This happens because the policy is querying the profiles table within its own policy

  2. Solution
    - Drop the problematic policy
    - Create a new policy that uses JWT claims instead of subqueries
    - Add a fallback for the specific admin user ID
    - Ensure the admin user has the correct role set
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create a new admin policy that doesn't cause recursion
-- This policy allows users with admin role in their JWT to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  TO authenticated
  USING (
    -- Check if the user has admin role in their JWT claims
    -- This avoids querying the profiles table and prevents recursion
    ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
    OR
    -- Fallback: allow if user is the specific admin user
    (auth.uid()::text = 'f6386c60-89e4-4c20-a731-7b80401ad7a7')
  );

-- Ensure the admin user has the correct role set
-- This is a one-time update to ensure the admin user has the proper role
UPDATE profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'vfreud@yahoo.com' AND role != 'admin';

-- Update the admin user's metadata to include role
-- This helps with the JWT-based policy
DO $$
BEGIN
  -- This is a placeholder since we can't directly update auth.users from SQL
  -- The actual metadata update will be done in the AuthContext.tsx file
  -- during sign in for the admin user
  RAISE NOTICE 'Remember to update user metadata for admin users';
END $$;

-- Make sure we have all the necessary public access policies
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