/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - The "Admins can manage all profiles" policy creates infinite recursion
    - It queries the profiles table within its own policy condition
    - This causes a loop when trying to check admin permissions

  2. Solution
    - Drop the problematic policy
    - Create a new policy that uses auth.jwt() claims instead of subqueries
    - Ensure admin users can still manage profiles without recursion

  3. Changes
    - Remove recursive admin policy
    - Add non-recursive admin policy using JWT claims
    - Maintain existing user permissions for own profile access
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
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    OR
    -- Fallback: allow if user is the specific admin user
    auth.uid()::text = 'f6386c60-89e4-4c20-a731-7b80401ad7a7'
  );

-- Ensure the admin user has the correct role set
-- This is a one-time update to ensure the admin user has the proper role
DO $$
BEGIN
  -- Update the admin user's role if they exist
  UPDATE profiles 
  SET role = 'admin', updated_at = now()
  WHERE email = 'vfreud@yahoo.com' AND role != 'admin';
  
  -- If no rows were affected, it means either the user doesn't exist or already has admin role
  -- This is fine and expected
END $$;