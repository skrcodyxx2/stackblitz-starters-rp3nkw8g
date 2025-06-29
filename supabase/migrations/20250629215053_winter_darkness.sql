/*
  # Fix staff management policies
  
  1. Improvements
    - Add staff management policies for menu and gallery
    - Simplify policy conditions for better performance
    - Fix potential recursion in policy checks
    
  2. Security
    - Ensure proper access for staff members
    - Maintain security while improving performance
*/

-- Fix staff management policies for menu categories
DROP POLICY IF EXISTS "Staff can manage menu categories" ON menu_categories;
CREATE POLICY "Staff can manage menu categories" ON menu_categories
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Fix staff management policies for menu items
DROP POLICY IF EXISTS "Staff can manage menu items" ON menu_items;
CREATE POLICY "Staff can manage menu items" ON menu_items
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Fix staff management policies for special menus
DROP POLICY IF EXISTS "Staff can manage special menus" ON special_menus;
CREATE POLICY "Staff can manage special menus" ON special_menus
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Fix staff management policies for gallery albums
DROP POLICY IF EXISTS "Staff can manage albums" ON gallery_albums;
CREATE POLICY "Staff can manage albums" ON gallery_albums
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Fix staff management policies for gallery images
DROP POLICY IF EXISTS "Staff can manage gallery images" ON gallery_images;
CREATE POLICY "Staff can manage gallery images" ON gallery_images
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Fix staff management policies for orders
DROP POLICY IF EXISTS "Staff can manage all orders" ON orders;
CREATE POLICY "Staff can manage all orders" ON orders
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Fix staff management policies for order items
DROP POLICY IF EXISTS "Staff can manage all order items" ON order_items;
CREATE POLICY "Staff can manage all order items" ON order_items
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Fix staff management policies for reservations
DROP POLICY IF EXISTS "Staff can manage all reservations" ON reservations;
CREATE POLICY "Staff can manage all reservations" ON reservations
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'employee'::text
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'employee')
    )
  );

-- Create a special policy for anyone to insert their own profile
DROP POLICY IF EXISTS "Anyone can create a profile" ON profiles;
CREATE POLICY "Anyone can create a profile" ON profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create a policy for users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create a policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Ensure public access to company settings
DROP POLICY IF EXISTS "Public can read company settings" ON company_settings;
CREATE POLICY "Public can read company settings" 
  ON company_settings FOR SELECT 
  TO anon, authenticated 
  USING (true);